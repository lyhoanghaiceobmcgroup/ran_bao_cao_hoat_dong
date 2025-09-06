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
  full_name: 'Nhân viên HN35',
  role: 'employee',
  branch: 'hn35',
  approval_status: 'approved'
};

async function fixHN35Employee() {
  try {
    console.log('🔧 Sửa chữa tài khoản nhân viên HN35...');
    
    // Bước 1: Tìm auth user theo email
    console.log('🔍 Tìm auth user theo email...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Lỗi lấy danh sách users:', listError.message);
      return;
    }
    
    const existingUser = users.users.find(user => user.email === EMPLOYEE_DATA.email);
    
    if (!existingUser) {
      console.log('❌ Không tìm thấy auth user với email:', EMPLOYEE_DATA.email);
      console.log('💡 Hãy chạy script tạo mới: node scripts/create-hn35-employee-complete.js');
      return;
    }
    
    console.log('✅ Tìm thấy auth user:', existingUser.id);
    
    // Bước 2: Kiểm tra profile hiện có
    console.log('📋 Kiểm tra profile hiện có...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', existingUser.id)
      .single();
    
    if (existingProfile) {
      console.log('⚠️  Profile đã tồn tại, đang cập nhật...');
      
      // Cập nhật profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: EMPLOYEE_DATA.email,
          full_name: EMPLOYEE_DATA.full_name,
          role: EMPLOYEE_DATA.role,
          branch: EMPLOYEE_DATA.branch,
          approval_status: EMPLOYEE_DATA.approval_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);
      
      if (updateError) {
        console.error('❌ Lỗi cập nhật profile:', updateError.message);
        return;
      }
      
      console.log('✅ Đã cập nhật profile thành công!');
    } else {
      console.log('📝 Tạo profile mới...');
      
      // Tạo profile mới
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: existingUser.id,
          email: EMPLOYEE_DATA.email,
          full_name: EMPLOYEE_DATA.full_name,
          role: EMPLOYEE_DATA.role,
          branch: EMPLOYEE_DATA.branch,
          approval_status: EMPLOYEE_DATA.approval_status
        });
      
      if (createError) {
        console.error('❌ Lỗi tạo profile:', createError.message);
        return;
      }
      
      console.log('✅ Đã tạo profile thành công!');
    }
    
    // Bước 3: Xác minh kết quả
    console.log('🔍 Xác minh kết quả...');
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', existingUser.id)
      .single();
    
    console.log('\n🎉 Tài khoản nhân viên HN35 đã sẵn sàng!');
    console.log('📋 Thông tin tài khoản:');
    console.log('   - Email:', finalProfile.email);
    console.log('   - Mật khẩu: 123123');
    console.log('   - Tên:', finalProfile.full_name);
    console.log('   - Vai trò:', finalProfile.role);
    console.log('   - Chi nhánh:', finalProfile.branch);
    console.log('   - Trạng thái:', finalProfile.approval_status);
    console.log('   - Auth ID:', existingUser.id);
    console.log('   - Profile ID:', finalProfile.id);
    console.log('\n🔐 Tài khoản có thể đăng nhập và truy cập /HN35-dashboard');
    console.log('🌐 Thử đăng nhập tại: http://localhost:8080/auth');
    
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error.message);
  }
}

// Chạy script
fixHN35Employee();