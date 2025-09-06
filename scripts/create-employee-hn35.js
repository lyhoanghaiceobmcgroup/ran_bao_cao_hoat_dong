// Script to create HN35 Employee account programmatically
// Run this script in Node.js environment with Supabase client

import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and Service Role Key (not anon key)
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // This has admin privileges

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createEmployeeHN35() {
  try {
    console.log('🚀 Creating HN35 Employee account...');
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'ranhn35@ran.com',
      password: '123123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Nhân viên HN35'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Create/Update profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: 'ranhn35@ran.com',
        full_name: 'Nhân viên HN35',
        role: 'employee',
        branch: 'hn35',
        approval_status: 'approved'
      })
      .select();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      return;
    }

    console.log('✅ Profile created:', profileData[0]);
    
    // Step 3: Verify account
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'ranhn35@ran.com')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying account:', verifyError.message);
      return;
    }

    console.log('🎉 HN35 Employee account created successfully!');
    console.log('📧 Email:', verifyData.email);
    console.log('👤 Name:', verifyData.full_name);
    console.log('🏢 Role:', verifyData.role);
    console.log('🏪 Branch:', verifyData.branch);
    console.log('✅ Status:', verifyData.approval_status);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Email: ranhn35@ran.com');
    console.log('   Password: 123123');
    console.log('   Access: HN35 Dashboard only');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
createEmployeeHN35();

// Export for use in other scripts
export { createEmployeeHN35 };

/*
Usage Instructions:

1. Install dependencies:
   npm install @supabase/supabase-js

2. Set up environment variables or replace the constants above:
   - YOUR_SUPABASE_URL: Your Supabase project URL
   - YOUR_SUPABASE_SERVICE_ROLE_KEY: Service role key (not anon key)

3. Run the script:
   node scripts/create-employee-hn35.js

4. The account will be created with:
   - Email: ranhn35@ran.com
   - Password: 123123
   - Role: employee
   - Branch: hn35
   - Status: approved

5. User can now login and will be redirected to HN35 Dashboard
*/