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

async function createTables() {
  try {
    console.log('🚀 Creating tables directly...');
    
    // Kiểm tra xem bảng profiles đã tồn tại chưa
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Profiles table already exists!');
      return;
    }
    
    console.log('Creating profiles table...');
    
    // Tạo bảng profiles bằng cách insert một record test (sẽ tự động tạo bảng)
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@test.com',
        full_name: 'Test User',
        role: 'employee',
        branch: 'hn35',
        approval_status: 'pending'
      })
      .select();
    
    if (error) {
      console.log('Table does not exist, this is expected. Error:', error.message);
      console.log('\n📋 Manual Setup Required:');
      console.log('Please run the following SQL in your Supabase SQL Editor:');
      console.log('\n--- Copy and paste this SQL ---');
      console.log(`
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('employee', 'manager', 'center')) NOT NULL DEFAULT 'employee',
  branch TEXT CHECK (branch IN ('hn35', 'hn40')),
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Center role can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'center' AND approval_status = 'approved'
    )
  );

CREATE POLICY "Center role can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'center' AND approval_status = 'approved'
    )
  );

-- Grant permissions
GRANT ALL ON public.profiles TO anon, authenticated;
`);
      console.log('\n--- End of SQL ---\n');
      console.log('After running the SQL, you can run the employee creation script again.');
    } else {
      console.log('✅ Profiles table created successfully!');
      
      // Xóa record test
      await supabase
        .from('profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

// Chạy tạo bảng
createTables();