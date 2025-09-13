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

// Employee data
const employees = [
  {
    email: 'khangthitbo123@gmail.com',
    password: '0865154423',
    full_name: 'Lành An Khang'
  },
  {
    email: 'lequocbao240107@gmail.com',
    password: '0832041111',
    full_name: 'LÊ QUỐC BẢO'
  },
  {
    email: 'lanphuongbe110207@gmail.com',
    password: '0385658335',
    full_name: 'Nguyễn lan phương'
  },
  {
    email: 'tducanh2002lc@gmail.com',
    password: '0828888598',
    full_name: 'ĐỨC ANH'
  },
  {
    email: 'volephuong3502@gmail.com',
    password: '0945373568',
    full_name: 'Võ Lê phương'
  },
  {
    email: 'Thanhtung.themask@gmail.com',
    password: '0942246586',
    full_name: 'Vũ thanh tùng'
  },
  {
    email: 'Mkd1272019@gmail.com',
    password: '0335103153',
    full_name: 'Mai khương duy'
  }
];

async function fixEmployeeAccounts() {
  console.log('=== FIXING EMPLOYEE ACCOUNTS ===\n');
  
  let successCount = 0;
  let errorCount = 0;
  let existingCount = 0;

  for (const employee of employees) {
    console.log(`Processing: ${employee.full_name}`);
    
    try {
      // Check if user already exists in auth.users
      const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
      
      if (checkError) {
        console.log(`❌ Error checking existing user for ${employee.full_name}: ${checkError.message}`);
        errorCount++;
        continue;
      }
      
      const userExists = existingUser.users.find(u => u.email === employee.email);
      
      if (userExists) {
        console.log(`⏭️  User already exists: ${employee.email}`);
        
        // Check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userExists.id)
          .single();
        
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.log(`❌ Error checking profile for ${employee.full_name}: ${profileCheckError.message}`);
          errorCount++;
          continue;
        }
        
        if (!existingProfile) {
          // Create profile for existing user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: userExists.id,
              full_name: employee.full_name,
              email: employee.email,
              role_name: 'staff',
              branch: 'HN35,HN40',
              company: 'RAN Group',
              status: 'approved',
              approved_at: new Date().toISOString()
            });
          
          if (profileError) {
            console.log(`❌ Error creating profile for ${employee.full_name}: ${profileError.message}`);
            errorCount++;
          } else {
            console.log(`✅ Profile created for existing user: ${employee.full_name}`);
            successCount++;
          }
        } else {
          // Update existing profile to ensure it's approved
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              status: 'approved',
              approved_at: existingProfile.approved_at || new Date().toISOString(),
              role_name: 'staff',
              branch: 'HN35,HN40'
            })
            .eq('user_id', userExists.id);
          
          if (updateError) {
            console.log(`❌ Error updating profile for ${employee.full_name}: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`✅ Profile updated for: ${employee.full_name}`);
            existingCount++;
          }
        }
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: employee.email,
          password: employee.password,
          email_confirm: true,
          user_metadata: {
            full_name: employee.full_name,
            role_name: 'staff',
            company: 'RAN Group',
            branch: 'HN35,HN40'
          }
        });
        
        if (createError) {
          console.log(`❌ Error creating user for ${employee.full_name}: ${createError.message}`);
          errorCount++;
          continue;
        }
        
        console.log(`✅ Auth user created for ${employee.full_name}`);
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: newUser.user.id,
            full_name: employee.full_name,
            email: employee.email,
            role_name: 'staff',
            branch: 'HN35,HN40',
            company: 'RAN Group',
            status: 'approved',
            approved_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.log(`❌ Error creating profile for ${employee.full_name}: ${profileError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Profile created for ${employee.full_name}`);
          successCount++;
        }
      }
    } catch (error) {
      console.log(`❌ Unexpected error for ${employee.full_name}: ${error.message}`);
      errorCount++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('=== RESULTS ===');
  console.log(`✅ Successfully processed: ${successCount} accounts`);
  console.log(`⏭️  Already existed: ${existingCount} accounts`);
  console.log(`❌ Errors: ${errorCount} accounts`);
  
  // List all employee accounts
  console.log('\n=== EMPLOYEE ACCOUNTS STATUS ===');
  
  try {
    // Get all users first
    const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      // Filter employee users
      const employeeUsers = allUsers.users.filter(user => 
        employees.some(emp => emp.email === user.email)
      );
      
      if (employeeUsers.length > 0) {
        // Get profiles for these users
        const userIds = employeeUsers.map(user => user.id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds)
          .order('full_name');
        
        if (profilesError) {
          console.log('❌ Error fetching profiles:', profilesError.message);
        } else {
          console.log('\n📋 Employee accounts:');
          employeeUsers.forEach((user, index) => {
            const employee = employees.find(e => e.email === user.email);
            const profile = profiles?.find(p => p.user_id === user.id);
            console.log(`${index + 1}. ${employee?.full_name || 'Unknown'}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password: ${employee?.password || 'N/A'}`);
            console.log(`   Status: ${profile?.status || 'No profile'}`);
            console.log(`   Role: ${profile?.role_name || 'N/A'}`);
            console.log(`   Branch: ${profile?.branch || 'N/A'}`);
            console.log(`   User ID: ${user.id}`);
            console.log('');
          });
        }
      } else {
        console.log('❌ No employee accounts found');
      }
    }
  } catch (error) {
    console.log('❌ Error listing accounts:', error.message);
  }
  
  console.log('=== COMPLETED ===');
}

// Run the script
fixEmployeeAccounts().catch(console.error);