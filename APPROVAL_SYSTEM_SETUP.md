# Hệ thống Duyệt Tài khoản - Hướng dẫn Thiết lập

## Tổng quan

Hệ thống duyệt tài khoản đã được triển khai hoàn chỉnh với kiến trúc sau:
- User đăng ký → Tạo profile với status "pending"
- Admin duyệt/từ chối tài khoản
- RLS chặn tất cả truy cập dữ liệu nghiệp vụ cho tài khoản chưa được duyệt

## Cách thiết lập Database

### Phương án 1: Sử dụng Migration (Khuyến nghị)

```bash
# Reset database để áp dụng tất cả migrations
supabase db reset

# Hoặc push migrations mới
supabase db push
```

### Phương án 2: Chạy SQL trực tiếp

Nếu gặp vấn đề với Docker, bạn có thể chạy file SQL sau trong Supabase SQL Editor:

```sql
-- File: supabase/migrations/20250119000006_complete_approval_schema.sql
-- Copy toàn bộ nội dung file này và chạy trong SQL Editor
```

## Lỗi thường gặp và cách khắc phục

### Lỗi: "column 'user_id' does not exist"

**Nguyên nhân**: RLS policies tham chiếu đến cột `user_id` không tồn tại trong cấu trúc database hiện tại.

**Nguyên nhân gốc:**
Database của bạn có thể có cấu trúc bảng profiles cũ sử dụng `id` làm primary key thay vì có cột `user_id` riêng biệt.

**Giải pháp:**
Các migration đã được cập nhật để tự động phát hiện cấu trúc bảng và sử dụng cột phù hợp:

1. **Phát hiện tự động**: Các hàm `is_user_approved()` và `is_approved()` giờ đây kiểm tra xem cột `user_id` có tồn tại không
2. **Logic dự phòng**: Nếu `user_id` không tồn tại, chúng sẽ sử dụng cột `id` thay thế
3. **Tương thích**: Hoạt động với cả cấu trúc bảng cũ và mới

**Để áp dụng bản sửa lỗi:**
```bash
# Phương án 1: Reset database (khuyến nghị)
supabase db reset

# Phương án 2: Push migrations mới
supabase db push
```

**Sửa lỗi thủ công (nếu cần):**
Nếu vẫn gặp lỗi, bạn có thể chạy thủ công các file migration đã cập nhật:
- `20250119000004_add_business_data_rls.sql`
- `20250119000006_complete_approval_schema.sql`

### Lỗi: "type approval_status already exists"

**Nguyên nhân**: Enum đã được tạo trong migration trước.

**Giải pháp**: Migration file đã xử lý trường hợp này với `DO $$ BEGIN ... EXCEPTION`

## Cấu trúc Database sau khi thiết lập

### Bảng chính

1. **app_admins**: Quản lý danh sách admin
   - `email`: Email admin
   - `created_at`: Thời gian tạo

2. **profiles**: Hồ sơ người dùng (đã có)
   - `status`: Trạng thái duyệt ('pending', 'approved', 'rejected')
   - `role_name`: Vai trò người dùng
   - Auto-approve cho email: `lyhoanghaiceo@gmail.com`

### Hàm tiện ích

- `current_email()`: Lấy email từ JWT
- `is_admin()`: Kiểm tra quyền admin
- `is_approved(uuid)`: Kiểm tra tài khoản đã được duyệt

### RLS Policies

Tất cả bảng nghiệp vụ đều có policy:
- Chỉ tài khoản `approved` mới truy cập được
- Admin có quyền quản lý tất cả
- Service role vẫn hoạt động bình thường

## Luồng hoạt động

### 1. Đăng ký tài khoản
```
User điền form → AuthContext tạo profile → Status = 'pending'
```

### 2. Kiểm tra trạng thái
```
User đăng nhập → PrivateRoute check status → Hiển thị ProfileStatusPage nếu pending
```

### 3. Duyệt tài khoản
```
Admin truy cập /admin → Xem danh sách pending → Approve/Reject
```

### 4. Truy cập hệ thống
```
User approved → Có thể truy cập dashboard và dữ liệu nghiệp vụ
```

## Test hệ thống

### 1. Test đăng ký
- Truy cập http://localhost:8080
- Đăng ký tài khoản mới
- Kiểm tra status = 'pending'

### 2. Test admin
- Đăng nhập với `lyhoanghaiceo@gmail.com`
- Truy cập `/admin`
- Duyệt tài khoản pending

### 3. Test RLS
- Tài khoản pending không thể truy cập dữ liệu nghiệp vụ
- Tài khoản approved có thể truy cập bình thường

## Lưu ý quan trọng

1. **Admin email**: `lyhoanghaiceo@gmail.com` sẽ được tự động approve khi đăng ký
2. **RLS Security**: Tất cả dữ liệu nghiệp vụ đều được bảo vệ
3. **Migration Order**: Chạy migrations theo thứ tự thời gian
4. **Docker**: Cần Docker Desktop để chạy `supabase db reset`

## Troubleshooting

Nếu gặp vấn đề, tham khảo:
- `MIGRATION_TROUBLESHOOTING.md`
- `DEPLOYMENT.md`
- Hoặc chạy SQL trực tiếp trong Supabase Dashboard