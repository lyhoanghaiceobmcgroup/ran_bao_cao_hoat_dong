// Script để tạo tài khoản admin thông qua signup thông thường

import { createClient } from '@supabase/supabase-js';

// Cấu hình Supabase
const SUPABASE_URL = "https://bhewlutzthgxcgcmyizy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZXdsdXR6dGhneGNnY215aXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTY0NDQsImV4cCI6MjA3MjY3MjQ0NH0.xt-tEVPcStK-ruBao3NXImRSyz0L3anwZ0fhaOcXYEI";

// Tạo Supabase client với anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Thông tin tài khoản admin
const adminAccount = {
  email: 'admin@ran.com',
  password: '123321'
};

// Hàm tạo tài khoản admin
async function createAdminAccount() {
  try {
    console.log(`Đang tạo tài khoản ${adminAccount.email}...`);
    
    // Đăng ký tài khoản mới
    const { data, error } = await supabase.auth.signUp({
      email: adminAccount.email,
      password: adminAccount.password
    });

    if (error) {
      console.error(`Lỗi khi tạo tài khoản ${adminAccount.email}:`);
      console.error('Error message:', error.message);
      console.error('Error code:', error.status);
      console.error('Full error:', JSON.stringify(error, null, 2));
      return;
    }

    if (data.user) {
      console.log(`✅ Đã tạo tài khoản ${adminAccount.email} thành công!`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`Email: ${data.user.email}`);
      
      // Nếu cần xác nhận email
      if (!data.user.email_confirmed_at) {
        console.log('⚠️  Lưu ý: Tài khoản cần được xác nhận qua email.');
      } else {
        console.log('✅ Email đã được xác nhận.');
      }
      
    } else {
      console.log('⚠️  Không nhận được thông tin user sau khi tạo tài khoản.');
      console.log('Data received:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error(`❌ Lỗi không xác định:`);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

// Hàm kiểm tra tài khoản đã tồn tại
async function checkExistingAccount() {
  try {
    console.log('Đang kiểm tra tài khoản hiện có...');
    
    // Thử đăng nhập để kiểm tra tài khoản đã tồn tại
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminAccount.email,
      password: adminAccount.password
    });
    
    if (data.user) {
      console.log('✅ Tài khoản admin@ran.com đã tồn tại và có thể đăng nhập!');
      console.log(`User ID: ${data.user.id}`);
      return true;
    }
    
    if (error) {
      console.log('ℹ️  Tài khoản chưa tồn tại hoặc mật khẩu không đúng.');
      return false;
    }
    
  } catch (error) {
    console.log('ℹ️  Không thể kiểm tra tài khoản hiện có.');
    return false;
  }
}

// Chạy script
console.log('=== SCRIPT TẠO TÀI KHOẢN ADMIN ===');

checkExistingAccount().then(async (exists) => {
  if (exists) {
    console.log('Tài khoản đã sẵn sàng sử dụng!');
  } else {
    console.log('Tiến hành tạo tài khoản mới...');
    await createAdminAccount();
  }
  console.log('=== HOÀN THÀNH ===');
});