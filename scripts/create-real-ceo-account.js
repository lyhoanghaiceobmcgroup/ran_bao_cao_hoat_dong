import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createCEOAccount() {
  try {
    console.log('Setting up CEO account...');
    
    // Kiểm tra user đã tồn tại chưa
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }
    
    let userId = null;
    const existingUser = existingUsers.users.find(user => user.email === 'lyhoanghaiceo@gmail.com');
    
    if (existingUser) {
      console.log('User already exists:', existingUser.id);
      userId = existingUser.id;
      
      // Cập nhật mật khẩu
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: 'Hai.1809'
      });
      
      if (updateError) {
        console.error('Error updating password:', updateError);
      } else {
        console.log('Password updated successfully');
      }
    } else {
      // Tạo user mới
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'lyhoanghaiceo@gmail.com',
        password: 'Hai.1809',
        email_confirm: true
      });
      
      if (authError) {
        console.error('Error creating auth user:', authError);
        return;
      }
      
      userId = authData.user.id;
      console.log('Auth user created:', userId);
    }
    
    // Tạo hoặc cập nhật profile trong profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: 'Lý Hoàng Hải',
        phone: '',
        company: 'RAN Group',
        role_name: 'central',
        branch: 'HN35-dashboard,HN40-Dashboard',
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (profileError) {
      console.error('Error upserting profile:', profileError);
      return;
    }
    
    console.log('Profile created/updated successfully');
    
    // Kiểm tra và tạo user role trong user_roles table
    const { data: existingRole, error: checkRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (checkRoleError) {
      console.error('Error checking existing role:', checkRoleError);
    } else if (!existingRole) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });
      
      if (roleError) {
        console.error('Error creating user role:', roleError);
        return;
      }
    }
     
     console.log('User role created/updated successfully');
    
    console.log('✅ CEO account created successfully!');
    console.log('Email: lyhoanghaiceo@gmail.com');
    console.log('Password: Hai.1809');
    console.log('Role: central');
    console.log('Branch: HN35-dashboard,HN40-Dashboard');
    console.log('Status: approved');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createCEOAccount();