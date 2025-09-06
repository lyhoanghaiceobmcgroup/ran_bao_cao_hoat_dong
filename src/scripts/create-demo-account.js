// Script để tạo tài khoản demo trong Supabase

import { createClient } from '@supabase/supabase-js';

// Cấu hình Supabase
const SUPABASE_URL = "https://bhewlutzthgxcgcmyizy.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZXdsdXR6dGhneGNnY215aXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTY0NDQsImV4cCI6MjA3MjY3MjQ0NH0.xt-tEVPcStK-ruBao3NXImRSyz0L3anwZ0fhaOcXYEI"; // API key mới

// Tạo Supabase client với service key để có quyền admin
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Thông tin các tài khoản demo
const demoAccounts = [
  {
    email: 'nhanvien@gmail.com',
    password: 'Hai.1809',
    role: 'staff'
  },
  {
    email: 'admin@ran.com',
    password: '123321',
    role: 'admin'
  }
];

// Hàm tạo tài khoản và gán role
async function createAccount(account) {
  try {
    // 1. Tạo tài khoản người dùng
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true // Xác nhận email ngay lập tức
    });

    if (userError) {
      console.error(`Lỗi khi tạo tài khoản ${account.email}:`, userError);
      return;
    }

    console.log(`Đã tạo tài khoản ${account.email} thành công`);

    // 2. Gán role cho người dùng
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userData.user.id,
        role: account.role
      });

    if (roleError) {
      console.error(`Lỗi khi gán role cho ${account.email}:`, roleError);
      return;
    }

    console.log(`Đã gán role ${account.role} cho ${account.email} thành công`);
  } catch (error) {
    console.error(`Lỗi không xác định khi tạo tài khoản ${account.email}:`, error);
  }
}

// Hàm tạo tất cả tài khoản demo
async function createAllDemoAccounts() {
  console.log('Bắt đầu tạo tài khoản demo...');
  
  for (const account of demoAccounts) {
    await createAccount(account);
    // Thêm delay nhỏ giữa các lần tạo tài khoản
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Hoàn thành tạo tài khoản demo!');
}

// Chạy script
createAllDemoAccounts();