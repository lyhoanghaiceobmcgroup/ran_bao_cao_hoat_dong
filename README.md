# RAN Shift Sync System

Hệ thống báo cáo ca làm việc cho chuỗi chi nhánh RAN Group F&B.

## Tính năng chính

- 🔐 **Xác thực và phân quyền**: Đăng nhập/đăng ký với phân quyền theo vai trò
- 🏢 **Quản lý chi nhánh**: Hỗ trợ nhiều chi nhánh (HN35, HN40, Trung tâm)
- 📊 **Dashboard theo vai trò**: Giao diện riêng cho từng loại người dùng
- ✅ **Hệ thống phê duyệt**: Quản lý tài khoản và phê duyệt người dùng mới
- 📱 **Responsive Design**: Tối ưu cho cả desktop và mobile

## Công nghệ sử dụng

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Authentication)
- **Deployment**: Vercel/Netlify + Supabase Cloud

## Project info

**URL**: https://lovable.dev/projects/06ebe15b-d34b-4dba-b466-019af3460e96

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/06ebe15b-d34b-4dba-b466-019af3460e96) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Cài đặt và chạy local

### 1. Clone repository
```bash
git clone <repository-url>
cd ran-shift-sync-main
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables
```bash
cp .env.example .env
```

Sửa file `.env` với thông tin thực tế:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Telegram Bot Configuration (optional)
VITE_TELEGRAM_BOT_TOKEN_HN35=your-bot-token
VITE_TELEGRAM_CHAT_ID_HN35=your-chat-id
```

### 4. Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:8080`

## Deploy lên Production

### 1. Setup Supabase Project

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Copy URL và anon key vào file `.env`
3. Chạy migrations:

```bash
# Link với Supabase project
supabase link --project-ref your-project-ref

# Deploy migrations
supabase db push
```

### 2. Deploy Frontend

#### Option A: Vercel
1. Connect repository với Vercel
2. Thêm environment variables
3. Deploy

#### Option B: Netlify
1. Connect repository với Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Thêm environment variables

### 3. Tạo tài khoản CEO (Admin)

Sau khi deploy, chạy script tạo tài khoản CEO:

```bash
node src/scripts/create-ceo-account.js
```

## Tài khoản Demo

- **Nhân viên**: `nhanvien@gmail.com` / `123456`
- **Admin**: `admin@ran.com` / `admin123`
- **CEO**: `lyhoanghaiceo@gmail.com` / `Hai.1809`

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/06ebe15b-d34b-4dba-b466-019af3460e96) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Hỗ trợ

Liên hệ: support@rangroup.vn

## License

© 2024 RAN Group. All rights reserved.
