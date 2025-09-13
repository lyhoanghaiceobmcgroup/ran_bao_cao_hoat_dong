// Script to create 7 employee accounts using Supabase Admin API
// This is a safer alternative to direct SQL insertion

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Employee data
const employees = [
  {
    email: 'khangthitbo123@gmail.com',
    password: '0865154423',
    full_name: 'Lành An Khang'
  },
  {
    email: 'lequocbao240107@gmail.com',
    password: '0832041111',
    full_name: 'LÊ QUỐC BẢO'
  },
  {
    email: 'lanphuongbe110207@gmail.com',
    password: '0385658335',
    full_name: 'Nguyễn lan phương'
  },
  {
    email: 'tducanh2002lc@gmail.com',
    password: '0828888598',
    full_name: 'ĐỨC ANH'
  },
  {
    email: 'volephuong3502@gmail.com',
    password: '0945373568',
    full_name: 'Võ Lê phương'
  },
  {
    email: 'Thanhtung.themask@gmail.com',
    password: '0942246586',
    full_name: 'Vũ thanh tùng'
  },
  {
    email: 'Mkd1272019@gmail.com',
    password: '0335103153',
    full_name: 'Mai khương duy'
  }
];

// Function to create a single employee account
async function createEmployeeAccount(employee) {
  try {
    console.log(`Creating account for: ${employee.full_name}`);
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employee.email,
      password: employee.password,
      email_confirm: true,
      user_metadata: {
        full_name: employee.full_name,
        role_name: 'staff',
        company: 'RAN Group',
        branch: 'HN35,HN40'
      }
    });

    if (authError) {
      console.error(`❌ Error creating auth user for ${employee.full_name}:`, authError.message);
      return false;
    }

    console.log(`✅ Auth user created for ${employee.full_name}`);

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: employee.full_name,
        phone: '',
        company: 'RAN Group',
        role_name: 'staff',
        branch: 'HN35,HN40',
        status: 'approved',
        approved_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`❌ Error creating profile for ${employee.full_name}:`, profileError.message);
      return false;
    }

    console.log(`✅ Profile created for ${employee.full_name}`);
    return true;

  } catch (error) {
    console.error(`❌ Unexpected error for ${employee.full_name}:`, error.message);
    return false;
  }
}

// Function to check if account already exists
async function checkExistingAccount(email) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error checking existing users:', error.message);
      return false;
    }
    
    return data.users.some(user => user.email === email);
  } catch (error) {
    console.error('Error checking existing account:', error.message);
    return false;
  }
}

// Main function to create all employee accounts
async function createAllEmployeeAccounts() {
  console.log('=== SCRIPT TẠO TÀI KHOẢN NHÂN VIÊN ===\n');
  
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('❌ Vui lòng cấu hình VITE_SUPABASE_URL trong file .env');
    return;
  }
  
  if (!supabaseServiceKey || supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY') {
    console.error('❌ Vui lòng cấu hình VITE_SUPABASE_SERVICE_ROLE_KEY trong file .env');
    return;
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const employee of employees) {
    // Check if account already exists
    const exists = await checkExistingAccount(employee.email);
    
    if (exists) {
      console.log(`⏭️  Tài khoản ${employee.full_name} (${employee.email}) đã tồn tại, bỏ qua...`);
      skipCount++;
      continue;
    }

    // Create new account
    const success = await createEmployeeAccount(employee);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n=== KẾT QUẢ ===');
  console.log(`✅ Tạo thành công: ${successCount} tài khoản`);
  console.log(`⏭️  Đã tồn tại: ${skipCount} tài khoản`);
  console.log(`❌ Lỗi: ${errorCount} tài khoản`);
  
  if (successCount > 0) {
    console.log('\n🎉 Các tài khoản nhân viên đã được tạo thành công!');
    console.log('Nhân viên có thể đăng nhập và truy cập báo cáo chi nhánh HN35 và HN40.');
  }
}

// Function to verify created accounts
async function verifyAccounts() {
  console.log('\n=== KIỂM TRA TÀI KHOẢN ĐÃ TẠO ===\n');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role_name', ['staff'])
      .eq('status', 'approved')
      .ilike('branch', '%HN35%');

    if (error) {
      console.error('❌ Lỗi khi kiểm tra tài khoản:', error.message);
      return;
    }

    console.log('📋 Danh sách tài khoản nhân viên đã tạo:');
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name}`);
      console.log(`   - Role: ${profile.role_name}`);
      console.log(`   - Branch: ${profile.branch}`);
      console.log(`   - Status: ${profile.status}`);
      console.log(`   - Created: ${new Date(profile.created_at).toLocaleString()}\n`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi không mong đợi:', error.message);
  }
}

// Run the script
createAllEmployeeAccounts()
  .then(() => verifyAccounts())
  .then(() => {
    console.log('=== HOÀN THÀNH ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });

// Instructions:
// 1. Cài đặt dependencies: npm install @supabase/supabase-js dotenv
// 2. Cấu hình environment variables trong .env:
//    VITE_SUPABASE_URL=your_supabase_url
//    VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
// 3. Chạy script: node scripts/create-employee-accounts.js
// 4. Tất cả 7 tài khoản nhân viên sẽ được tạo với quyền truy cập HN35 và HN40