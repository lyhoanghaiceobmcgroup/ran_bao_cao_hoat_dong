import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Debug environment variables
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY length:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.length);

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

console.log('Supabase client created successfully');

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

async function createEmployeeManual(employee) {
  console.log(`\n=== CREATING: ${employee.name} ===`);
  
  try {
    // Bước 1: Tạo user trong auth
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employee.email,
      password: employee.password,
      email_confirm: true,
      user_metadata: {
        full_name: employee.name,
        branch: employee.branch,
        role: employee.role
      }
    });

    if (authError) {
      console.log(`❌ Auth error: ${authError.message}`);
      return { success: false, error: authError.message };
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // Bước 2: Tạo profile
    console.log('Step 2: Creating profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: employee.name,
        branch: employee.branch,
        role: employee.role,
        status: 'approved'
      })
      .select();

    if (profileError) {
      console.log(`❌ Profile error: ${profileError.message}`);
      // Nếu profile lỗi, xóa auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: profileError.message };
    }

    console.log(`✅ Profile created successfully`);
    return { success: true, userId: authData.user.id };

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('=== MANUAL EMPLOYEE CREATION ===\n');
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const employee of employees) {
    const result = await createEmployeeManual(employee);
    
    if (result.success) {
      successCount++;
      console.log(`✅ ${employee.name} - SUCCESS`);
    } else {
      errorCount++;
      console.log(`❌ ${employee.name} - FAILED: ${result.error}`);
    }
    
    results.push({
      name: employee.name,
      email: employee.email,
      success: result.success,
      error: result.error || null
    });
    
    // Delay giữa các lần tạo
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n=== FINAL SUMMARY ===');
  console.log(`✅ Successfully created: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  
  console.log('\n=== DETAILED RESULTS ===');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name} (${result.email})`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n=== COMPLETED ===');
}

main().catch(console.error);