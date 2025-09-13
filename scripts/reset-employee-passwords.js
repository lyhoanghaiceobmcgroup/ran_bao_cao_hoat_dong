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

const employeeEmails = [
  'Thanhtung.themask@gmail.com',
  'Mkd1272019@gmail.com'
];

async function resetEmployeePasswords() {
  console.log('🔑 Resetting employee passwords and confirming emails...');
  
  // Get all auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }
  
  const authUsers = authData.users || [];
  
  for (const email of employeeEmails) {
    console.log(`\n=== PROCESSING: ${email} ===`);
    
    const user = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      continue;
    }
    
    console.log(`👤 Found user: ${user.id}`);
    console.log(`📧 Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    
    // Update user to confirm email and reset password
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: 'RanEmployee2024!',
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          password_reset: true
        }
      }
    );
    
    if (updateError) {
      console.error(`❌ Error updating user ${email}:`, updateError);
    } else {
      console.log(`✅ Password reset and email confirmed for ${email}`);
      console.log(`   User ID: ${updateData.user.id}`);
      console.log(`   Email confirmed: ${updateData.user.email_confirmed_at ? 'Yes' : 'No'}`);
    }
  }
  
  console.log('\n=== TESTING LOGIN AFTER RESET ===');
  
  // Create a new client for testing login
  const testClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  for (const email of employeeEmails) {
    console.log(`\n🔐 Testing login for: ${email}`);
    
    try {
      const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
        email: email,
        password: 'RanEmployee2024!'
      });
      
      if (loginError) {
        console.error(`❌ Login failed for ${email}:`, loginError.message);
        continue;
      }
      
      console.log(`✅ Login successful for ${email}`);
      console.log(`   User ID: ${loginData.user.id}`);
      
      // Test profile access
      const { data: profile, error: profileError } = await testClient
        .from('profiles')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single();
      
      if (profileError) {
        console.error(`❌ Profile access failed:`, profileError.message);
      } else {
        console.log(`✅ Profile access successful`);
        console.log(`   Name: ${profile.full_name}`);
        console.log(`   Role: ${profile.role_name}`);
        console.log(`   Status: ${profile.status}`);
      }
      
      // Sign out
      await testClient.auth.signOut();
      
    } catch (error) {
      console.error(`❌ Unexpected error testing ${email}:`, error);
    }
  }
  
  console.log('\n=== FINAL SUMMARY ===');
  console.log('✅ Employee accounts ready for use:');
  console.log('   📧 Thanhtung.themask@gmail.com');
  console.log('   📧 Mkd1272019@gmail.com');
  console.log('   🔑 Password: RanEmployee2024!');
  console.log('\n=== COMPLETED ===');
}

resetEmployeePasswords().catch(console.error);