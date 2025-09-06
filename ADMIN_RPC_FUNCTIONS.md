# Admin-Only RPC Functions với SECURITY DEFINER

File này mô tả các RPC functions được tạo với `SECURITY DEFINER` để chỉ admin mới có thể gọi được.

## Tổng quan

Các functions này được thiết kế với các tính năng bảo mật cao:
- **SECURITY DEFINER**: Functions chạy với quyền của người tạo function (postgres)
- **SET search_path = 'public'**: Ngăn chặn search path attacks
- **Role checking**: Kiểm tra người gọi có role admin không
- **Account status checking**: Đảm bảo tài khoản admin đã được phê duyệt
- **Input validation**: Validate tham số đầu vào
- **Self-protection**: Ngăn admin xóa chính tài khoản của mình

## Danh sách Functions

### 1. `admin_get_all_users()`
**Mục đích**: Lấy danh sách tất cả người dùng trong hệ thống

**Cú pháp**:
```sql
SELECT * FROM public.admin_get_all_users();
```

**Trả về**:
- `user_id`: UUID của người dùng
- `email`: Email của người dùng
- `role`: Vai trò (admin, manager, staff, central)
- `account_status`: Trạng thái tài khoản (pending, approved, rejected)
- `created_at`: Thời gian tạo tài khoản

**Bảo mật**: Chỉ admin được phê duyệt mới có thể gọi

### 2. `admin_update_account_status(user_id, status, rejected_reason)`
**Mục đích**: Cập nhật trạng thái phê duyệt tài khoản người dùng

**Tham số**:
- `_user_id` (UUID): ID của người dùng cần cập nhật
- `_status` (TEXT): Trạng thái mới ('pending', 'approved', 'rejected')
- `_rejected_reason` (TEXT, optional): Lý do từ chối (chỉ khi status = 'rejected')

**Cú pháp**:
```sql
-- Phê duyệt tài khoản
SELECT public.admin_update_account_status('user-uuid-here', 'approved', NULL);

-- Từ chối tài khoản với lý do
SELECT public.admin_update_account_status('user-uuid-here', 'rejected', 'Thông tin không hợp lệ');
```

**Trả về**: Boolean (true nếu thành công)

**Bảo mật**: 
- Chỉ admin được phê duyệt mới có thể gọi
- Validate status phải là một trong các giá trị hợp lệ
- Tự động cập nhật approved_by và approved_at

### 3. `admin_delete_user(user_id)`
**Mục đích**: Xóa tài khoản người dùng khỏi hệ thống

**Tham số**:
- `_user_id` (UUID): ID của người dùng cần xóa

**Cú pháp**:
```sql
SELECT public.admin_delete_user('user-uuid-here');
```

**Trả về**: Boolean (true nếu thành công)

**Bảo mật**: 
- Chỉ admin được phê duyệt mới có thể gọi
- Không thể xóa chính tài khoản của mình
- Xóa cascade từ auth.users và user_roles

### 4. `admin_get_system_stats()`
**Mục đích**: Lấy thống kê tổng quan của hệ thống

**Cú pháp**:
```sql
SELECT public.admin_get_system_stats();
```

**Trả về**: JSON object chứa:
- `total_users`: Tổng số người dùng
- `pending_approvals`: Số tài khoản chờ phê duyệt
- `approved_users`: Số tài khoản đã phê duyệt
- `rejected_users`: Số tài khoản bị từ chối
- `users_by_role`: Phân bố người dùng theo vai trò

**Bảo mật**: Chỉ admin được phê duyệt mới có thể gọi

## Cách triển khai

### Bước 1: Chạy Migration
```bash
# Nếu có Docker Desktop
supabase db reset

# Hoặc chạy trực tiếp trong Supabase SQL Editor
# Copy nội dung từ file migration và chạy
```

### Bước 2: Test Functions
```sql
-- Chạy file test_admin_rpc.sql trong Supabase SQL Editor
-- Hoặc test từng function riêng lẻ
```

### Bước 3: Tạo Admin Account
```sql
-- Cập nhật một user thành admin để test
UPDATE public.user_roles 
SET role = 'admin', account_status = 'approved' 
WHERE user_id = 'YOUR_USER_ID_HERE';
```

## Sử dụng trong Frontend

### Với Supabase Client
```typescript
// Gọi RPC function từ frontend
const { data, error } = await supabase
  .rpc('admin_get_all_users');

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Users:', data);
}

// Cập nhật trạng thái tài khoản
const { data: updateResult, error: updateError } = await supabase
  .rpc('admin_update_account_status', {
    _user_id: 'user-uuid-here',
    _status: 'approved',
    _rejected_reason: null
  });
```

### Error Handling
```typescript
try {
  const { data, error } = await supabase.rpc('admin_get_all_users');
  
  if (error) {
    if (error.message.includes('Access denied')) {
      // User không có quyền admin
      console.error('Bạn không có quyền truy cập chức năng này');
    } else {
      console.error('Lỗi khác:', error.message);
    }
  }
} catch (err) {
  console.error('Network error:', err);
}
```

## Lưu ý Bảo mật

1. **Không bao giờ expose admin credentials**: Đảm bảo chỉ tài khoản admin thực sự mới có role 'admin'

2. **Validate input**: Các functions đã có validation, nhưng frontend cũng nên validate

3. **Audit logging**: Có thể thêm logging để theo dõi các thao tác admin

4. **Rate limiting**: Cân nhắc thêm rate limiting cho các functions quan trọng

5. **Regular review**: Định kỳ review quyền admin và các functions

## Troubleshooting

### Lỗi "Access denied: Admin role required"
- Kiểm tra user có role 'admin' không
- Kiểm tra account_status = 'approved'
- Đảm bảo đã đăng nhập đúng tài khoản

### Lỗi "Cannot delete your own account"
- Đây là tính năng bảo mật, admin không thể xóa chính mình
- Cần admin khác để xóa tài khoản

### Functions trả về empty
- Kiểm tra quyền admin
- Kiểm tra kết nối database
- Xem logs trong Supabase Dashboard

## Mở rộng

Có thể thêm các functions khác như:
- `admin_bulk_approve_users()`: Phê duyệt hàng loạt
- `admin_export_users()`: Xuất danh sách người dùng
- `admin_audit_log()`: Xem log hoạt động
- `admin_system_health()`: Kiểm tra sức khỏe hệ thống