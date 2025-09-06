import { createClient } from '@supabase/supabase-js';

// Cấu hình Supabase
const SUPABASE_URL = 'https://bhewlutzthgxcgcmyizy.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZXdsdXR6dGhneGNnY215aXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5NjQ0NCwiZXhwIjoyMDcyNjcyNDQ0fQ.XpAysBnGRQRimjetCzPd1wvegh3IPogZKjc2nb13dCY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Thông tin tài khoản nhân viên HN35
const EMPLOYEE_DATA = {
  email: 'ranhn35@ran.com',
  password: '123123',
  full_name: 'Nhân viên HN35',
  role: 'employee',
  branch: 'hn35',
  approval_status: 'approved'
};

async function createHN35Employee() {
  try {
    console.log('🚀 Tạo tài khoản nhân viên HN35...');
    
    // Bước 1: Kiểm tra xem tài khoản đã tồn tại chưa
    console.log('📋 Kiểm tra tài khoản hiện có...');
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', EMPLOYEE_DATA.email)
      .single();
    
    if (existingProfile) {
      console.log('⚠️  Tài khoản đã tồn tại:', existingProfile.email);
      console.log('📊 Thông tin hiện tại:');
      console.log('   - ID:', existingProfile.id);
      console.log('   - Tên:', existingProfile.full_name);
      console.log('   - Vai trò:', existingProfile.role);
      console.log('   - Chi nhánh:', existingProfile.branch);
      console.log('   - Trạng thái:', existingProfile.approval_status);
      
      // Cập nhật thông tin nếu cần
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: EMPLOYEE_DATA.full_name,
          role: EMPLOYEE_DATA.role,
          branch: EMPLOYEE_DATA.branch,
          approval_status: EMPLOYEE_DATA.approval_status,
          updated_at: new Date().toISOString()
        })
        .eq('email', EMPLOYEE_DATA.email);
      
      if (updateError) {
        console.error('❌ Lỗi cập nhật profile:', updateError.message);
      } else {
        console.log('✅ Đã cập nhật thông tin tài khoản!');
      }
      
      return;
    }
    
    // Bước 2: Tạo auth user
    console.log('👤 Tạo auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: EMPLOYEE_DATA.email,
      password: EMPLOYEE_DATA.password,
      email_confirm: true,
      user_metadata: {
        full_name: EMPLOYEE_DATA.full_name
      }
    });
    
    if (authError) {
      console.error('❌ Lỗi tạo auth user:', authError.message);
      return;
    }
    
    console.log('✅ Auth user đã tạo:', authData.user.id);
    
    // Bước 3: Tạo profile
    console.log('📝 Tạo profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: EMPLOYEE_DATA.email,
        full_name: EMPLOYEE_DATA.full_name,
        role: EMPLOYEE_DATA.role,
        branch: EMPLOYEE_DATA.branch,
        approval_status: EMPLOYEE_DATA.approval_status
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Lỗi tạo profile:', profileError.message);
      
      // Xóa auth user nếu tạo profile thất bại
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log('🗑️  Đã xóa auth user do lỗi tạo profile');
      return;
    }
    
    console.log('✅ Profile đã tạo thành công!');
    
    // Bước 4: Xác minh tài khoản
    console.log('🔍 Xác minh tài khoản...');
    const { data: verifyData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', EMPLOYEE_DATA.email)
      .single();
    
    console.log('\n🎉 Tài khoản nhân viên HN35 đã được tạo thành công!');
    console.log('📋 Thông tin tài khoản:');
    console.log('   - Email:', verifyData.email);
    console.log('   - Mật khẩu:', EMPLOYEE_DATA.password);
    console.log('   - Tên:', verifyData.full_name);
    console.log('   - Vai trò:', verifyData.role);
    console.log('   - Chi nhánh:', verifyData.branch);
    console.log('   - Trạng thái:', verifyData.approval_status);
    console.log('   - ID:', verifyData.id);
    console.log('\n🔐 Tài khoản có thể đăng nhập và truy cập /HN35-dashboard');
    
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error.message);
  }
}

// Chạy script
createHN35Employee();