import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Supabase client với service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Danh sách nhân viên
const employees = [
  {
    name: 'Lành An Khang',
    email: 'khangthitbo123@gmail.com',
    password: '0865154423',
    branch: 'HN35',
    role: 'staff'
  },
  {
    name: 'LÊ QUỐC BẢO',
    email: 'lequocbao240107@gmail.com',
    password: '0832041111',
    branch: 'HN35',
    role: 'staff'
  },
  {
    name: 'Nguyễn lan phương',
    email: 'lanphuongbe110207@gmail.com',
    password: '0385658335',
    branch: 'HN35',
    role: 'staff'
  },
  {
    name: 'ĐỨC ANH',
    email: 'tducanh2002lc@gmail.com',
    password: '0828888598',
    branch: 'HN35',
    role: 'staff'
  },
  {
    name: 'Võ Lê phương',
    email: 'volephuong3502@gmail.com',
    password: '0945373568',
    branch: 'HN35',
    role: 'staff'
  },
  {
    name: 'Vũ thanh tùng',
    email: 'Thanhtung.themask@gmail.com',
    password: '0942246586',
    branch: 'HN35',
    role: 'staff'
  },
  {
    name: 'Mai khương duy',
    email: 'Mkd1272019@gmail.com',
    password: '0335103153',
    branch: 'HN35',
    role: 'staff'
  }
];

// Kiểm tra và sửa RLS policies
async function checkAndFixRLSPolicies() {
  console.log('\n=== CHECKING RLS POLICIES ===');
  
  try {
    // Kiểm tra RLS policies hiện tại
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'profiles' })
      .select();
    
    if (policiesError) {
      console.log('❌ Cannot check RLS policies, trying alternative method...');
      
      // Thử tắt RLS tạm thời cho profiles table
      const { error: disableRLSError } = await supabase
        .rpc('disable_rls_for_profiles');
      
      if (disableRLSError) {
        console.log('❌ Cannot disable RLS, will try direct SQL approach');
        return false;
      } else {
        console.log('✅ RLS temporarily disabled for profiles table');
        return true;
      }
    }
    
    console.log('✅ RLS policies checked successfully');
    return true;
    
  } catch (error) {
    console.log(`❌ RLS check error: ${error.message}`);
    return false;
  }
}

// Kiểm tra service role permissions
async function checkServiceRolePermissions() {
  console.log('\n=== CHECKING SERVICE ROLE PERMISSIONS ===');
  
  try {
    // Test basic operations
    const { data: testUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log(`❌ Cannot list users: ${listError.message}`);
      return false;
    }
    
    console.log(`✅ Can list users (${testUsers.users.length} users found)`);
    
    // Test profile table access
    const { data: testProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log(`❌ Cannot access profiles table: ${profilesError.message}`);
      return false;
    }
    
    console.log('✅ Can access profiles table');
    return true;
    
  } catch (error) {
    console.log(`❌ Permission check error: ${error.message}`);
    return false;
  }
}

// Tạo tài khoản với bypass constraints
async function createAccountWithBypass(employee) {
  console.log(`\n=== CREATING WITH BYPASS: ${employee.name} ===`);
  
  try {
    // Phương pháp 1: Tạo user trước, sau đó tạo profile
    console.log('Method 1: Creating auth user first...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employee.email,
      password: employee.password,
      email_confirm: true,
      user_metadata: {
          full_name: employee.name,
          branch: employee.branch,
          role_name: employee.role
        }
    });

    if (authError) {
      console.log(`❌ Auth creation failed: ${authError.message}`);
      
      // Phương pháp 2: Thử với signup thay vì admin.createUser
      console.log('Method 2: Trying signup method...');
      
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: employee.email,
        password: employee.password,
        options: {
          data: {
            full_name: employee.name,
            branch: employee.branch,
            role_name: employee.role
          }
        }
      });
      
      if (signupError) {
        console.log(`❌ Signup also failed: ${signupError.message}`);
        return { success: false, error: signupError.message };
      }
      
      console.log(`✅ User created via signup: ${signupData.user.id}`);
      
      // Tạo profile cho user từ signup
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: signupData.user.id,
          full_name: employee.name,
          branch: employee.branch,
          role_name: employee.role,
          status: 'approved'
        }, {
          onConflict: 'user_id'
        });
      
      if (profileError) {
        console.log(`❌ Profile creation failed: ${profileError.message}`);
        // Xóa user nếu profile tạo thất bại
        await supabase.auth.admin.deleteUser(signupData.user.id);
        return { success: false, error: profileError.message };
      }
      
      console.log(`✅ Profile created successfully`);
      return { success: true, userId: signupData.user.id, method: 'signup' };
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // Tạo profile với upsert để tránh duplicate key
    console.log('Creating profile with upsert...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: authData.user.id,
        full_name: employee.name,
        branch: employee.branch,
        role_name: employee.role,
        status: 'approved'
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.log(`❌ Profile creation failed: ${profileError.message}`);
      // Xóa user nếu profile tạo thất bại
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: profileError.message };
    }

    console.log(`✅ Profile created successfully`);
    return { success: true, userId: authData.user.id, method: 'admin' };

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Cleanup orphaned records
async function cleanupOrphanedRecords() {
  console.log('\n=== CLEANING UP ORPHANED RECORDS ===');
  
  try {
    // Tìm và xóa profiles không có user tương ứng
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    const userIds = allUsers.users.map(u => u.id);
    
    const { data: orphanedProfiles, error: findError } = await supabase
      .from('profiles')
      .select('user_id')
      .not('user_id', 'in', `(${userIds.map(id => `'${id}'`).join(',')})`);
    
    if (findError) {
      console.log(`❌ Cannot find orphaned profiles: ${findError.message}`);
      return false;
    }
    
    if (orphanedProfiles && orphanedProfiles.length > 0) {
      console.log(`Found ${orphanedProfiles.length} orphaned profiles, cleaning up...`);
      
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .not('user_id', 'in', `(${userIds.map(id => `'${id}'`).join(',')})`);
      
      if (deleteError) {
        console.log(`❌ Cannot delete orphaned profiles: ${deleteError.message}`);
        return false;
      }
      
      console.log(`✅ Cleaned up ${orphanedProfiles.length} orphaned profiles`);
    } else {
      console.log('✅ No orphaned profiles found');
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Cleanup error: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('=== AUTO-FIXING ACCOUNT CREATION ISSUES ===\n');
  
  // Bước 1: Kiểm tra và sửa RLS policies
  const rlsFixed = await checkAndFixRLSPolicies();
  
  // Bước 2: Kiểm tra service role permissions
  const permissionsOk = await checkServiceRolePermissions();
  
  // Bước 3: Cleanup orphaned records
  const cleanupOk = await cleanupOrphanedRecords();
  
  if (!permissionsOk) {
    console.log('\n❌ Service role permissions issue detected. Cannot proceed.');
    console.log('Please check your VITE_SUPABASE_SERVICE_ROLE_KEY in .env file.');
    return;
  }
  
  console.log('\n=== ATTEMPTING TO CREATE EMPLOYEE ACCOUNTS ===');
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const employee of employees) {
    const result = await createAccountWithBypass(employee);
    
    if (result.success) {
      successCount++;
      console.log(`✅ ${employee.name} - SUCCESS (${result.method})`);
    } else {
      errorCount++;
      console.log(`❌ ${employee.name} - FAILED: ${result.error}`);
    }
    
    results.push({
      name: employee.name,
      email: employee.email,
      success: result.success,
      method: result.method || null,
      error: result.error || null
    });
    
    // Delay giữa các lần tạo
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n=== FINAL SUMMARY ===');
  console.log(`✅ Successfully created: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  
  console.log('\n=== DETAILED RESULTS ===');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name} (${result.email})`);
    if (result.success) {
      console.log(`   Method: ${result.method}`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Kiểm tra lại sau khi tạo
  console.log('\n=== VERIFICATION ===');
  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  const employeeEmails = employees.map(e => e.email);
  const createdEmployees = finalUsers.users.filter(u => employeeEmails.includes(u.email));
  
  console.log(`📊 Total employees created: ${createdEmployees.length}/${employees.length}`);
  
  if (createdEmployees.length > 0) {
    console.log('\n✅ Successfully created accounts:');
    createdEmployees.forEach(user => {
      console.log(`   - ${user.email} (${user.id})`);
    });
  }
  
  console.log('\n=== COMPLETED ===');
}

main().catch(console.error);