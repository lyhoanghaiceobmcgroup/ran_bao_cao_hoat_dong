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

// Test account data
const testAccount = {
  email: 'test@ran.com',
  password: '123456',
  full_name: 'Test User'
};

async function createTestAccount() {
  console.log('=== CREATING TEST ACCOUNT ===\n');
  
  try {
    // Check if user already exists
    const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }
    
    const existingUser = allUsers.users.find(u => u.email === testAccount.email);
    
    if (existingUser) {
      console.log(`⏭️  User already exists: ${testAccount.email}`);
      console.log(`🆔 User ID: ${existingUser.id}`);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', existingUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.log(`❌ Error checking profile: ${profileError.message}`);
      } else if (!profile) {
        console.log('⚠️  No profile found, creating one...');
        
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: existingUser.id,
            full_name: testAccount.full_name,
            role_name: 'staff',
            branch: 'HN35',
            company: 'RAN Group',
            status: 'approved',
            approved_at: new Date().toISOString()
          });
        
        if (createProfileError) {
          console.log(`❌ Error creating profile: ${createProfileError.message}`);
        } else {
          console.log(`✅ Profile created successfully`);
        }
      } else {
        console.log(`✅ Profile exists - Status: ${profile.status}`);
        
        // Update to approved if needed
        if (profile.status !== 'approved') {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              status: 'approved',
              approved_at: new Date().toISOString()
            })
            .eq('user_id', existingUser.id);
          
          if (updateError) {
            console.log(`❌ Error updating profile: ${updateError.message}`);
          } else {
            console.log(`✅ Profile updated to approved`);
          }
        }
      }
    } else {
      console.log(`Creating new user: ${testAccount.email}`);
      
      // Try to create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testAccount.email,
        password: testAccount.password,
        email_confirm: true,
        user_metadata: {
          full_name: testAccount.full_name
        }
      });
      
      if (createError) {
        console.log(`❌ Error creating user: ${createError.message}`);
        
        // Try alternative method - using signup
        console.log('\n🔄 Trying alternative signup method...');
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testAccount.email,
          password: testAccount.password,
          options: {
            data: {
              full_name: testAccount.full_name
            }
          }
        });
        
        if (signupError) {
          console.log(`❌ Signup also failed: ${signupError.message}`);
          return;
        } else {
          console.log(`✅ User created via signup: ${signupData.user?.id}`);
          
          if (signupData.user) {
            // Create profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: signupData.user.id,
                full_name: testAccount.full_name,
                role_name: 'staff',
                branch: 'HN35',
                company: 'RAN Group',
                status: 'approved',
                approved_at: new Date().toISOString()
              });
            
            if (profileError) {
              console.log(`❌ Error creating profile: ${profileError.message}`);
            } else {
              console.log(`✅ Profile created successfully`);
            }
          }
        }
      } else {
        console.log(`✅ User created successfully: ${newUser.user.id}`);
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: newUser.user.id,
            full_name: testAccount.full_name,
            role_name: 'staff',
            branch: 'HN35',
            company: 'RAN Group',
            status: 'approved',
            approved_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.log(`❌ Error creating profile: ${profileError.message}`);
        } else {
          console.log(`✅ Profile created successfully`);
        }
      }
    }
    
    // Test login
    console.log('\n=== TESTING LOGIN ===');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testAccount.email,
      password: testAccount.password
    });
    
    if (loginError) {
      console.log(`❌ Login failed: ${loginError.message}`);
    } else {
      console.log(`✅ Login successful!`);
      console.log(`🆔 User ID: ${loginData.user?.id}`);
      console.log(`📧 Email: ${loginData.user?.email}`);
      
      // Sign out
      await supabase.auth.signOut();
      console.log(`🚪 Signed out successfully`);
    }
    
    console.log('\n=== TEST ACCOUNT INFO ===');
    console.log(`📧 Email: ${testAccount.email}`);
    console.log(`🔑 Password: ${testAccount.password}`);
    console.log(`👤 Name: ${testAccount.full_name}`);
    console.log(`\n✅ You can now try logging in with this account!`);
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
  
  console.log('\n=== COMPLETED ===');
}

// Run the script
createTestAccount().catch(console.error);