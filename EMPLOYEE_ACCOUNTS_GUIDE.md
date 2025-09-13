# Hướng Dẫn Tạo Tài Khoản Nhân Viên

## 📋 Tổng Quan
Script này sẽ tạo 7 tài khoản nhân viên có thể đăng nhập ngay lập tức vào hệ thống RAN Shift Sync.

## 🚀 Cách Thực Hiện

### Bước 1: Mở Supabase Studio
1. Truy cập: https://supabase.com/dashboard
2. Chọn project: `bhewlutzthgxcgcmyizy`
3. Vào **SQL Editor**

### Bước 2: Chạy Script Tạo Tài Khoản
1. Mở file `create_working_employee_accounts.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor trong Supabase Studio
4. Nhấn **Run** để thực thi

### Bước 3: Kiểm Tra Kết Quả
1. Mở file `verify_employee_accounts.sql`
2. Copy và chạy trong SQL Editor
3. Xem kết quả để đảm bảo tất cả tài khoản đã được tạo thành công

## 👥 Danh Sách Tài Khoản Được Tạo

| STT | Họ Tên | Email | Mật Khẩu | Chi Nhánh |
|-----|--------|-------|----------|----------|
| 1 | Lành An Khang | khangthitbo123@gmail.com | 0865154423 | HN35,HN40 |
| 2 | LÊ QUỐC BẢO | lequocbao240107@gmail.com | 0832041111 | HN35,HN40 |
| 3 | Nguyễn lan phương | lanphuongbe110207@gmail.com | 0385658335 | HN35,HN40 |
| 4 | ĐỨC ANH | tducanh2002lc@gmail.com | 0828888598 | HN35,HN40 |
| 5 | Võ Lê phương | volephuong3502@gmail.com | 0945373568 | HN35,HN40 |
| 6 | Vũ thanh tùng | Thanhtung.themask@gmail.com | 0942246586 | HN35,HN40 |
| 7 | Mai khương duy | Mkd1272019@gmail.com | 0335103153 | HN35,HN40 |

## ✅ Tính Năng Của Script

### 1. Sửa Lỗi Function
- Khắc phục lỗi `auto_approve_admin` function
- Xử lý trường hợp thiếu `user_id`
- Tự động phê duyệt admin

### 2. Tạo Tài Khoản Hoàn Chỉnh
- Tạo user trong `auth.users`
- Tạo profile trong `public.profiles`
- Mã hóa mật khẩu an toàn
- Xác nhận email tự động

### 3. Cấu Hình Quyền
- Tất cả tài khoản có role `staff`
- Status `approved` (đã phê duyệt)
- Truy cập cả 2 chi nhánh HN35 và HN40

## 🔍 Kiểm Tra Tài Khoản

Sau khi chạy script, bạn có thể:

1. **Kiểm tra trong database:**
   ```sql
   SELECT u.email, p.full_name, p.status 
   FROM auth.users u 
   JOIN public.profiles p ON u.id = p.user_id;
   ```

2. **Test đăng nhập:**
   - Vào trang login của ứng dụng
   - Sử dụng email/password từ bảng trên
   - Kiểm tra truy cập các tính năng

## 🛠️ Xử Lý Sự Cố

### Nếu Script Báo Lỗi:
1. Kiểm tra kết nối Supabase
2. Đảm bảo có quyền admin
3. Chạy lại từng phần của script

### Nếu Không Đăng Nhập Được:
1. Chạy script `verify_employee_accounts.sql`
2. Kiểm tra status tài khoản
3. Xem log lỗi trong browser console

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Chạy script kiểm tra trước
2. Gửi kết quả kiểm tra
3. Mô tả chi tiết lỗi gặp phải

---

**Lưu ý:** Mật khẩu được sử dụng là số điện thoại của từng nhân viên để dễ nhớ và quản lý.