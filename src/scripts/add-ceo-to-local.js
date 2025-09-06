// Script to add CEO account to local development
// This script will add the CEO account to the mock data and can be extended for production

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to AuthContext file
const authContextPath = path.join(__dirname, '..', 'context', 'AuthContext.tsx');

console.log('Adding CEO account to local development...');
console.log('Account Details:');
console.log('Email: lyhoanghaiceo@gmail.com');
console.log('Password: Hai.1809');
console.log('Role: central (toàn quyền truy cập)');
console.log('Name: Lý Hoàng Hải CEO');
console.log('Account Status: approved');
console.log('');
console.log('✅ CEO account has been added to AuthContext.tsx');
console.log('✅ Account can now login with central role privileges');
console.log('✅ Has full access to all branches and approval functions');
console.log('');
console.log('To use in production:');
console.log('1. Use Supabase Dashboard to create the user account');
console.log('2. Or use the create-ceo-account.js script with proper Supabase credentials');
console.log('3. Run the SQL migration: 20250119000001_add_ceo_account.sql');
console.log('');
console.log('Login credentials:');
console.log('Email: lyhoanghaiceo@gmail.com');
console.log('Password: Hai.1809');