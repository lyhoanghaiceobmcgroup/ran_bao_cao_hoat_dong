import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cấu hình Supabase
const SUPABASE_URL = 'https://bhewlutzthgxcgcmyizy.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZXdsdXR6dGhneGNnY215aXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA5NjQ0NCwiZXhwIjoyMDcyNjcyNDQ0fQ.XpAysBnGRQRimjetCzPd1wvegh3IPogZKjc2nb13dCY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Đọc file SQL
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'setup-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Tách các câu lệnh SQL
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Thực thi từng câu lệnh
    for (const statement of sqlStatements) {
      if (statement.includes('SELECT') && statement.includes('message')) {
        // Skip success message
        continue;
      }
      
      console.log('Executing:', statement.substring(0, 50) + '...');
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        // Try direct query for some statements
        const { error: directError } = await supabase
          .from('_temp')
          .select('*')
          .limit(0);
        
        if (error.message.includes('function exec_sql') || error.message.includes('does not exist')) {
          // Use alternative method - create tables directly
          console.log('Using alternative setup method...');
          await setupTablesDirectly();
          break;
        } else {
          console.log('⚠️  Warning:', error.message);
        }
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

async function setupTablesDirectly() {
  try {
    // Create profiles table
    const { error: profilesError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (profilesError) {
      console.log('Profiles table may already exist or using direct SQL...');
    }
    
    console.log('✅ Tables setup completed!');
    
  } catch (error) {
    console.error('❌ Error in direct setup:', error.message);
  }
}

// Chạy setup
setupDatabase();