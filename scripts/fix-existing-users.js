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

// Danh sách nhân viên đã đăng ký
const existingEmployees = [
  {
    name: 'Vũ thanh tùng',
    email: 'Thanhtung.themask@gmail.com',
    branch: 'HN35',
    role: 'staff'
  },
  {
    name: 'Mai khương duy',
    email: 'Mkd1272019@gmail.com',
    branch: 'HN35',
    role: 'staff'
  }
];

async function fixExistingUser(employee) {
  console.log(`\n=== FIXING: ${employee.name} ===`);
  
  try {
    // Bước 1: Tìm user trong auth
    console.log('Step 1: Finding auth user...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log(`❌ Error listing users: ${listError.message}`);
      return { success: false, error: listError.message };
    }
    
    const user = users.users.find(u => u.email === employee.email);
    if (!user) {
      console.log(`❌ User not found in auth`);
      return { success: false, error: 'User not found in auth' };
    }
    
    console.log(`✅ Found auth user: ${user.id}`);
    
    // Bước 2: Kiểm tra profile
    console.log('Step 2: Checking profile...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id);
    
    if (profileError) {
      console.log(`❌ Error checking profile: ${profileError.message}`);
      return { success: false, error: profileError.message };
    }
    
    if (profiles && profiles.length > 0) {
      console.log(`✅ Profile already exists`);
      console.log(`   Status: ${profiles[0].status}`);
      
      // Cập nhật profile nếu cần
      if (profiles[0].status !== 'approved') {
        console.log('Step 3: Updating profile status...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ status: 'approved' })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.log(`❌ Error updating profile: ${updateError.message}`);
          return { success: false, error: updateError.message };
        }
        
        console.log(`✅ Profile status updated to approved`);
      }
      
      return { success: true, userId: user.id, action: 'updated' };
    } else {
      // Tạo profile mới
      console.log('Step 3: Creating new profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: employee.name,
          branch: employee.branch,
          role: employee.role,
          status: 'approved'
        })
        .select();
      
      if (createError) {
        console.log(`❌ Error creating profile: ${createError.message}`);
        return { success: false, error: createError.message };
      }
      
      console.log(`✅ Profile created successfully`);
      return { success: true, userId: user.id, action: 'created' };
    }
    
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('=== FIXING EXISTING USERS ===\n');
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const employee of existingEmployees) {
    const result = await fixExistingUser(employee);
    
    if (result.success) {
      successCount++;
      console.log(`✅ ${employee.name} - SUCCESS (${result.action})`);
    } else {
      errorCount++;
      console.log(`❌ ${employee.name} - FAILED: ${result.error}`);
    }
    
    results.push({
      name: employee.name,
      email: employee.email,
      success: result.success,
      action: result.action || null,
      error: result.error || null
    });
    
    // Delay giữa các lần xử lý
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== FINAL SUMMARY ===');
  console.log(`✅ Successfully fixed: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  
  console.log('\n=== DETAILED RESULTS ===');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name} (${result.email})`);
    if (result.success) {
      console.log(`   Action: ${result.action}`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n=== COMPLETED ===');
}

main().catch(console.error);