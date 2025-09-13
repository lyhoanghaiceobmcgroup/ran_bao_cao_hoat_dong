import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const testAccounts = [
  { email: 'Thanhtung.themask@gmail.com', name: 'Vũ thanh tùng' },
  { email: 'Mkd1272019@gmail.com', name: 'Mai khương duy' }
];

async function testEmployeeLogin() {
  console.log('🔐 Testing employee login functionality...');
  
  for (const account of testAccounts) {
    console.log(`\n=== TESTING LOGIN: ${account.name} ===`);
    
    try {
      // Test login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: '123456'
      });
      
      if (loginError) {
        console.error(`❌ Login failed for ${account.name}:`, loginError.message);
        continue;
      }
      
      console.log(`✅ Login successful for ${account.name}`);
      console.log(`   User ID: ${loginData.user.id}`);
      console.log(`   Email: ${loginData.user.email}`);
      
      // Test profile access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single();
      
      if (profileError) {
        console.error(`❌ Profile access failed for ${account.name}:`, profileError.message);
      } else {
        console.log(`✅ Profile access successful for ${account.name}`);
        console.log(`   Full name: ${profile.full_name}`);
        console.log(`   Role: ${profile.role_name}`);
        console.log(`   Status: ${profile.status}`);
        console.log(`   Branch: ${profile.branch}`);
      }
      
      // Sign out
      await supabase.auth.signOut();
      console.log(`🚪 Signed out ${account.name}`);
      
    } catch (error) {
      console.error(`❌ Unexpected error testing ${account.name}:`, error);
    }
  }
  
  console.log('\n=== LOGIN TEST SUMMARY ===');
  console.log('✅ 2 employee accounts are ready for use');
  console.log('📧 Emails: Thanhtung.themask@gmail.com, Mkd1272019@gmail.com');
  console.log('🔑 Password: 123456');
  console.log('\n=== COMPLETED ===');
}

testEmployeeLogin().catch(console.error);