import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Employee emails to check
const employeeEmails = [
  'khangthitbo123@gmail.com',
  'lequocbao240107@gmail.com',
  'lanphuongbe110207@gmail.com',
  'tducanh2002lc@gmail.com',
  'volephuong3502@gmail.com',
  'Thanhtung.themask@gmail.com',
  'Mkd1272019@gmail.com'
];

const employeeData = {
  'khangthitbo123@gmail.com': { name: 'Lành An Khang', password: '0865154423' },
  'lequocbao240107@gmail.com': { name: 'LÊ QUỐC BẢO', password: '0832041111' },
  'lanphuongbe110207@gmail.com': { name: 'Nguyễn lan phương', password: '0385658335' },
  'tducanh2002lc@gmail.com': { name: 'ĐỨC ANH', password: '0828888598' },
  'volephuong3502@gmail.com': { name: 'Võ Lê phương', password: '0945373568' },
  'Thanhtung.themask@gmail.com': { name: 'Vũ thanh tùng', password: '0942246586' },
  'Mkd1272019@gmail.com': { name: 'Mai khương duy', password: '0335103153' }
};

async function checkExistingUsers() {
  console.log('=== CHECKING EXISTING USERS ===\n');
  
  try {
    // Get all users
    const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }
    
    console.log(`📊 Total users in database: ${allUsers.users.length}`);
    
    // Check which employee emails exist
    const existingEmployeeUsers = [];
    const missingEmployeeEmails = [];
    
    for (const email of employeeEmails) {
      const user = allUsers.users.find(u => u.email === email);
      if (user) {
        existingEmployeeUsers.push(user);
        console.log(`✅ Found user: ${email} (ID: ${user.id})`);
      } else {
        missingEmployeeEmails.push(email);
        console.log(`❌ Missing user: ${email}`);
      }
    }
    
    console.log(`\n📋 Summary:`);
    console.log(`✅ Existing employee users: ${existingEmployeeUsers.length}`);
    console.log(`❌ Missing employee users: ${missingEmployeeEmails.length}`);
    
    // Check profiles for existing users
    if (existingEmployeeUsers.length > 0) {
      console.log('\n=== CHECKING PROFILES ===');
      
      for (const user of existingEmployeeUsers) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.log(`❌ Error checking profile for ${user.email}: ${profileError.message}`);
        } else if (!profile) {
          console.log(`⚠️  No profile found for ${user.email}`);
          
          // Try to create profile
          const employeeInfo = employeeData[user.email];
          if (employeeInfo) {
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                full_name: employeeInfo.name,
                role_name: 'staff',
                branch: 'HN35,HN40',
                company: 'RAN Group',
                status: 'approved',
                approved_at: new Date().toISOString()
              });
            
            if (createProfileError) {
              console.log(`❌ Error creating profile for ${user.email}: ${createProfileError.message}`);
            } else {
              console.log(`✅ Profile created for ${user.email}`);
            }
          }
        } else {
          console.log(`✅ Profile exists for ${user.email} - Status: ${profile.status}`);
          
          // Update profile to ensure it's approved
          if (profile.status !== 'approved') {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: 'approved',
                approved_at: profile.approved_at || new Date().toISOString(),
                role_name: 'staff',
                branch: 'HN35,HN40'
              })
              .eq('user_id', user.id);
            
            if (updateError) {
              console.log(`❌ Error updating profile for ${user.email}: ${updateError.message}`);
            } else {
              console.log(`✅ Profile updated for ${user.email}`);
            }
          }
        }
      }
    }
    
    // Final status check
    console.log('\n=== FINAL STATUS ===');
    
    for (const email of employeeEmails) {
      const user = allUsers.users.find(u => u.email === email);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        const employeeInfo = employeeData[email];
        console.log(`\n👤 ${employeeInfo.name}`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Password: ${employeeInfo.password}`);
        console.log(`   🆔 User ID: ${user.id}`);
        console.log(`   📋 Profile: ${profile ? 'Yes' : 'No'}`);
        console.log(`   ✅ Status: ${profile?.status || 'No profile'}`);
        console.log(`   🏢 Branch: ${profile?.branch || 'N/A'}`);
        console.log(`   🎭 Role: ${profile?.role_name || 'N/A'}`);
      } else {
        const employeeInfo = employeeData[email];
        console.log(`\n❌ ${employeeInfo.name}`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Password: ${employeeInfo.password}`);
        console.log(`   Status: USER NOT CREATED`);
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
  
  console.log('\n=== COMPLETED ===');
}

// Run the script
checkExistingUsers().catch(console.error);