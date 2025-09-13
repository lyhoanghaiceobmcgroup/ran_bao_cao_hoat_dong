# Hướng dẫn Tạo Tài khoản Nhân viên

## Tổng quan

Hệ thống đã được chuẩn bị để tạo 7 tài khoản nhân viên với quyền truy cập vào báo cáo chi nhánh HN35 và HN40.

## Danh sách Tài khoản Nhân viên

| STT | Họ tên | Email | Mật khẩu | Vai trò | Chi nhánh |
|-----|--------|-------|----------|---------|----------|
| 1 | Lành An Khang | khangthitbo123@gmail.com | 0865154423 | Nhân viên | HN35, HN40 |
| 2 | LÊ QUỐC BẢO | lequocbao240107@gmail.com | 0832041111 | Nhân viên | HN35, HN40 |
| 3 | Nguyễn lan phương | lanphuongbe110207@gmail.com | 0385658335 | Nhân viên | HN35, HN40 |
| 4 | ĐỨC ANH | tducanh2002lc@gmail.com | 0828888598 | Nhân viên | HN35, HN40 |
| 5 | Võ Lê phương | volephuong3502@gmail.com | 0945373568 | Nhân viên | HN35, HN40 |
| 6 | Vũ thanh tùng | Thanhtung.themask@gmail.com | 0942246586 | Nhân viên | HN35, HN40 |
| 7 | Mai khương duy | Mkd1272019@gmail.com | 0335103153 | Nhân viên | HN35, HN40 |

## Phương án 1: Sử dụng Script JavaScript (Khuyến nghị)

### Bước 1: Chuẩn bị môi trường

```bash
# Cài đặt dependencies nếu chưa có
npm install @supabase/supabase-js
```

### Bước 2: Cấu hình Environment Variables

Tạo hoặc cập nhật file `.env` với thông tin Supabase:

```env
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Lưu ý:** 
- `VITE_SUPABASE_URL`: URL của project Supabase (có thể lấy từ Settings > API)
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (có thể lấy từ Settings > API, tab "service_role")

### Bước 3: Chạy Script

```bash
node scripts/create-employee-accounts.js
```

### Kết quả mong đợi:

```
=== SCRIPT TẠO TÀI KHOẢN NHÂN VIÊN ===

Creating account for: Lành An Khang
✅ Auth user created for Lành An Khang
✅ Profile created for Lành An Khang

... (tương tự cho các tài khoản khác)

=== KẾT QUẢ ===
✅ Tạo thành công: 7 tài khoản
⏭️  Đã tồn tại: 0 tài khoản
❌ Lỗi: 0 tài khoản

🎉 Các tài khoản nhân viên đã được tạo thành công!
Nhân viên có thể đăng nhập và truy cập báo cáo chi nhánh HN35 và HN40.
```

## Phương án 2: Sử dụng SQL Script

### Bước 1: Mở Supabase Studio

1. Truy cập [Supabase Studio](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor**

### Bước 2: Chạy Script SQL

1. Mở file `create_employee_accounts.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Nhấn **Run** để thực thi

### Bước 3: Kiểm tra kết quả

Script sẽ hiển thị bảng kết quả với thông tin các tài khoản đã tạo:

```sql
-- Kết quả sẽ hiển thị:
email                          | full_name           | role_name | branch    | status   | created_at
khangthitbo123@gmail.com       | Lành An Khang       | staff     | HN35,HN40 | approved | 2024-01-20...
lequocbao240107@gmail.com      | LÊ QUỐC BẢO         | staff     | HN35,HN40 | approved | 2024-01-20...
...
```

## Kiểm tra Tài khoản đã tạo

### Cách 1: Qua Supabase Studio

1. Vào **Authentication > Users**
2. Kiểm tra danh sách users mới tạo
3. Vào **Table Editor > profiles**
4. Kiểm tra profiles với `role_name = 'staff'` và `status = 'approved'`

### Cách 2: Qua SQL Query

```sql
SELECT 
    u.email,
    p.full_name,
    p.role_name,
    p.branch,
    p.status,
    p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN (
    'khangthitbo123@gmail.com',
    'lequocbao240107@gmail.com', 
    'lanphuongbe110207@gmail.com',
    'tducanh2002lc@gmail.com',
    'volephuong3502@gmail.com',
    'Thanhtung.themask@gmail.com',
    'Mkd1272019@gmail.com'
)
ORDER BY p.created_at;
```

## Test Đăng nhập

### Bước 1: Truy cập ứng dụng

Mở trình duyệt và truy cập: http://localhost:8080/

### Bước 2: Thử đăng nhập

Sử dụng một trong các tài khoản đã tạo:
- **Email:** khangthitbo123@gmail.com
- **Mật khẩu:** 0865154423

### Bước 3: Kiểm tra quyền truy cập

Sau khi đăng nhập thành công:
1. Nhân viên sẽ thấy trang chọn Dashboard
2. Có thể truy cập cả HN35 Dashboard và HN40 Dashboard
3. Có thể tạo và xem báo cáo ca làm việc

## Troubleshooting

### Lỗi: "Invalid API key"

**Nguyên nhân:** Service Role Key không đúng hoặc chưa được cấu hình.

**Giải pháp:**
1. Kiểm tra file `.env`
2. Đảm bảo `SUPABASE_SERVICE_ROLE_KEY` là service role key (không phải anon key)
3. Restart script sau khi cập nhật .env

### Lỗi: "User already registered"

**Nguyên nhân:** Email đã được sử dụng để tạo tài khoản trước đó.

**Giải pháp:**
1. Script sẽ tự động bỏ qua các tài khoản đã tồn tại
2. Hoặc xóa user cũ trong Supabase Studio > Authentication > Users

### Lỗi: "Permission denied"

**Nguyên nhân:** RLS policies chặn việc tạo profile.

**Giải pháp:**
1. Đảm bảo đã chạy migration schema mới nhất
2. Kiểm tra RLS policies trong Supabase Studio

### Lỗi: "Database connection failed"

**Nguyên nhân:** URL Supabase không đúng hoặc database không khả dụng.

**Giải pháp:**
1. Kiểm tra `VITE_SUPABASE_URL` trong file .env
2. Đảm bảo Supabase project đang hoạt động
3. Kiểm tra kết nối internet

## Quyền truy cập của Nhân viên

Sau khi tạo thành công, các nhân viên sẽ có:

✅ **Được phép:**
- Đăng nhập vào hệ thống
- Truy cập HN35 Dashboard
- Truy cập HN40 Dashboard  
- Tạo báo cáo bắt đầu ca
- Tạo báo cáo kết thúc ca
- Xem lịch sử báo cáo của mình

❌ **Không được phép:**
- Truy cập Center Dashboard (chỉ dành cho admin/central)
- Duyệt tài khoản người dùng khác
- Xem báo cáo của nhân viên khác
- Thay đổi cấu hình hệ thống

## Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình tạo tài khoản, vui lòng:
1. Kiểm tra logs trong console
2. Kiểm tra Supabase Studio > Logs
3. Đảm bảo đã làm theo đúng hướng dẫn
4. Liên hệ admin hệ thống để được hỗ trợ