# 🚀 Hướng Dẫn Deploy RAN Shift Sync System

## Tóm Tắt Nhanh

### 1. Deploy Code lên GitHub
```bash
# Sử dụng script tự động (Windows)
npm run deploy

# Hoặc sử dụng script bash (Linux/Mac)
npm run deploy:bash

# Hoặc thực hiện thủ công
git add .
git commit -m "Deploy RAN Shift Sync System"
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### 2. Setup Supabase Database

#### Bước 1: Tạo Project Supabase
1. Truy cập [supabase.com](https://supabase.com)
2. Tạo project mới
3. Copy Project URL và anon key

#### Bước 2: Cấu hình Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Bước 3: Setup Database

**⚠️ QUAN TRỌNG: Bạn cần chạy SQL này trong Supabase SQL Editor trước khi tạo tài khoản**

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng </> ở sidebar)
4. Tạo một **New Query** và copy-paste đoạn SQL sau:

```sql
-- Tạo bảng profiles
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
```

5. Nhấn **Run** để thực thi SQL
6. Kiểm tra trong **Table Editor** để xác nhận bảng `profiles` đã được tạo

#### Bước 4: Tạo CEO Account
1. Đăng ký tài khoản đầu tiên qua app
2. Copy User ID từ auth.users table
3. Chỉnh sửa `scripts/create-ceo-account.sql`
4. Chạy script trong SQL Editor

#### Bước 5: Tạo Demo Accounts

**Tài khoản Nhân viên HN35:**
- Email: ranhn35@ran.com
- Password: 123123
- Role: employee
- Branch: hn35

**Cách 1: Sử dụng Supabase Dashboard**
1. Vào Authentication > Users
2. Add user với email và password trên
3. Chạy script `scripts/create-employee-hn35.sql`

**Cách 2: Sử dụng Script tự động**
```bash
node scripts/create-employee-hn35.js
```

### 3. Deploy Frontend

#### Option A: Vercel (Khuyến nghị)
1. Kết nối GitHub repo với Vercel
2. Set environment variables
3. Deploy tự động

#### Option B: Netlify
1. Kết nối GitHub repo với Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables

### 4. Kiểm Tra Deploy

✅ **Checklist sau khi deploy:**
- [ ] Website load được
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập thành công
- [ ] Chọn chi nhánh được
- [ ] Dashboard hiển thị đúng
- [ ] CEO account có thể approve tài khoản
- [ ] Logout redirect về /auth

## Scripts Có Sẵn

- `npm run deploy` - Deploy tự động (Windows)
- `npm run deploy:bash` - Deploy tự động (Linux/Mac)
- `npm run build` - Build production
- `npm run dev` - Chạy development server

## Troubleshooting

### Lỗi Supabase Connection
```bash
# Kiểm tra Supabase CLI
supabase --version

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Lỗi Build
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Lỗi Environment Variables
- Kiểm tra file `.env` có đúng format
- Đảm bảo variables được set trong hosting platform
- Restart development server sau khi thay đổi .env

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề trong quá trình deploy, vui lòng:
1. Kiểm tra console logs
2. Xem Supabase logs
3. Kiểm tra network requests
4. Liên hệ team support

---

**Chúc bạn deploy thành công! 🎉**