import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

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

const employees = [
  { name: 'Lành An Khang', email: 'khangthitbo123@gmail.com', phone: '0123456789', branch: 'Main', role: 'employee' },
  { name: 'LÊ QUỐC BẢO', email: 'lequocbao240107@gmail.com', phone: '0123456790', branch: 'Main', role: 'employee' },
  { name: 'Nguyễn lan phương', email: 'lanphuongbe110207@gmail.com', phone: '0123456791', branch: 'Main', role: 'employee' },
  { name: 'ĐỨC ANH', email: 'tducanh2002lc@gmail.com', phone: '0123456792', branch: 'Main', role: 'employee' },
  { name: 'Võ Lê phương', email: 'volephuong3502@gmail.com', phone: '0123456793', branch: 'Main', role: 'employee' },
  { name: 'Vũ thanh tùng', email: 'Thanhtung.themask@gmail.com', phone: '0123456794', branch: 'Main', role: 'employee' },
  { name: 'Mai khương duy', email: 'Mkd1272019@gmail.com', phone: '0123456795', branch: 'Main', role: 'employee' }
];

async function syncAuthAndProfiles() {
  console.log('🔄 Starting auth and profiles synchronization...');
  
  // 1. Get all auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }
  
  const authUsers = authData.users || [];
  console.log(`📊 Found ${authUsers.length} auth users`);
  
  // 2. Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
    return;
  }
  
  console.log(`📊 Found ${profiles.length} profiles`);
  
  // 3. Find orphaned profiles (profiles without corresponding auth users)
  const authUserIds = new Set(authUsers.map(u => u.id));
  const orphanedProfiles = profiles.filter(p => !authUserIds.has(p.user_id));
  
  console.log(`🗑️ Found ${orphanedProfiles.length} orphaned profiles`);
  
  // 4. Delete orphaned profiles
  if (orphanedProfiles.length > 0) {
    const orphanedIds = orphanedProfiles.map(p => p.user_id);
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .in('user_id', orphanedIds);
    
    if (deleteError) {
      console.error('❌ Error deleting orphaned profiles:', deleteError);
    } else {
      console.log(`✅ Deleted ${orphanedProfiles.length} orphaned profiles`);
    }
  }
  
  // 5. Find auth users without profiles
  const profileUserIds = new Set(profiles.map(p => p.user_id));
  const usersWithoutProfiles = authUsers.filter(u => !profileUserIds.has(u.id));
  
  console.log(`👤 Found ${usersWithoutProfiles.length} auth users without profiles`);
  
  // 6. Create profiles for auth users that don't have them
  for (const user of usersWithoutProfiles) {
    const userEmail = user.email;
    const employee = employees.find(emp => emp.email.toLowerCase() === userEmail.toLowerCase());
    
    if (employee) {
      console.log(`📝 Creating profile for ${employee.name} (${userEmail})`);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: employee.name,
          phone: employee.phone || '',
          company: 'RAN',
          role_name: 'employee',
          branch: employee.branch || 'Main',
          status: 'approved',
          approved_by: 'system',
          approved_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error(`❌ Error creating profile for ${employee.name}:`, insertError);
      } else {
        console.log(`✅ Profile created for ${employee.name}`);
      }
    } else {
      console.log(`⚠️ No employee data found for auth user: ${userEmail}`);
    }
  }
  
  // 7. Now try to create missing employee accounts
  console.log('\n🔄 Creating missing employee accounts...');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const employee of employees) {
    console.log(`\n=== PROCESSING: ${employee.name} ===`);
    
    // Check if user already exists in auth
    const existingAuthUser = authUsers.find(u => u.email.toLowerCase() === employee.email.toLowerCase());
    
    if (existingAuthUser) {
      console.log(`✅ Auth user already exists: ${employee.name}`);
      
      // Check if profile exists
      const existingProfile = profiles.find(p => p.user_id === existingAuthUser.id);
      if (existingProfile) {
        console.log(`✅ Profile already exists: ${employee.name}`);
        successCount++;
      } else {
        console.log(`📝 Creating missing profile for: ${employee.name}`);
        // Profile creation logic already handled above
        successCount++;
      }
      continue;
    }
    
    // Create new auth user
    console.log(`👤 Creating auth user: ${employee.name}`);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: employee.email,
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: employee.name,
        branch: employee.branch,
        role_name: employee.role
      }
    });
    
    if (createError) {
      console.error(`❌ Error creating auth user for ${employee.name}:`, createError);
      failCount++;
      continue;
    }
    
    console.log(`✅ Auth user created: ${employee.name} (${newUser.user.id})`);
    
    // Create profile
    console.log(`📝 Creating profile for: ${employee.name}`);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        full_name: employee.name,
        phone: employee.phone || '',
        company: 'RAN',
        role_name: 'employee',
        branch: employee.branch || 'Main',
        status: 'approved',
        approved_by: 'system',
        approved_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error(`❌ Error creating profile for ${employee.name}:`, profileError);
      failCount++;
    } else {
      console.log(`✅ Profile created for ${employee.name}`);
      successCount++;
    }
  }
  
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  // Final verification
  console.log('\n=== VERIFICATION ===');
  const { data: finalAuthData } = await supabase.auth.admin.listUsers();
  const { data: finalProfiles } = await supabase.from('profiles').select('*');
  
  const employeeEmails = employees.map(e => e.email.toLowerCase());
  const finalAuthUsers = finalAuthData?.users || [];
  
  const employeeAuthUsers = finalAuthUsers.filter(u => 
    employeeEmails.includes(u.email.toLowerCase())
  );
  
  const employeeProfiles = finalProfiles?.filter(p => 
    employeeAuthUsers.some(u => u.id === p.user_id)
  ) || [];
  
  console.log(`📊 Total employee auth accounts: ${employeeAuthUsers.length}/${employees.length}`);
  console.log(`📊 Total employee profiles: ${employeeProfiles.length}/${employees.length}`);
  
  console.log('\n=== COMPLETED ===');
}

syncAuthAndProfiles().catch(console.error);