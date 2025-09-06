// Script to create CEO account in Supabase
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createCEOAccount() {
  try {
    console.log('Creating CEO account...');
    
    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'lyhoanghaiceo@gmail.com',
      password: 'Hai.1809',
      options: {
        data: {
          name: 'Lý Hoàng Hải CEO',
          role: 'central',
          branch: '',
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authData.user?.email);

    // Insert user profile into profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user?.id,
          email: 'lyhoanghaiceo@gmail.com',
          name: 'Lý Hoàng Hải CEO',
          role: 'central',
          branch: '',
          account_status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('CEO account created successfully!');
    console.log('Email: lyhoanghaiceo@gmail.com');
    console.log('Password: Hai.1809');
    console.log('Role: central (toàn quyền truy cập)');
    console.log('Account Status: approved');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createCEOAccount();