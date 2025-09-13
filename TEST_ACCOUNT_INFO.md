# Tài Khoản Test - RAN Shift Sync

## 🎯 Tài Khoản Test Đã Sẵn Sàng

Tài khoản test đã được tạo thành công và có thể đăng nhập ngay!

### 📋 Thông Tin Đăng Nhập

```
📧 Email: test@ran.com
🔑 Mật khẩu: 123456
👤 Tên: Test User
🏢 Chi nhánh: HN35
🎭 Vai trò: Staff
✅ Trạng thái: Approved
```

## 🚀 Cách Sử Dụng

### 1. Đăng Nhập
1. Mở ứng dụng trong trình duyệt
2. Nhập email: `test@ran.com`
3. Nhập mật khẩu: `123456`
4. Nhấn "Đăng nhập"

### 2. Kiểm Tra Chức Năng
Sau khi đăng nhập thành công, bạn có thể:
- ✅ Truy cập Dashboard
- ✅ Xem báo cáo ca làm việc
- ✅ Tạo báo cáo mới
- ✅ Truy cập các tính năng của nhân viên

## 🔧 Khắc Phục Lỗi 400 Bad Request

Lỗi 400 Bad Request trước đây có thể do:
1. **Không có tài khoản để đăng nhập** ✅ Đã khắc phục
2. **Tài khoản chưa được approve** ✅ Đã khắc phục
3. **Thiếu profile trong database** ✅ Đã khắc phục

## 📝 Ghi Chú Kỹ Thuật

### Tình Trạng Tài Khoản Nhân Viên
Các tài khoản nhân viên ban đầu chưa được tạo thành công do:
- Lỗi "Database error creating new user"
- Có thể do RLS policies hoặc cấu hình Supabase

### Giải Pháp Tạm Thời
- Sử dụng tài khoản test để kiểm tra ứng dụng
- Tài khoản test hoạt động bình thường
- Có thể tạo thêm tài khoản test khác nếu cần

## 🛠️ Tạo Tài Khoản Test Khác

Nếu cần tạo thêm tài khoản test:

```bash
node scripts/create-test-account.js
```

*Lưu ý: Sửa email trong script trước khi chạy*

## ✅ Xác Nhận Hoạt Động

- [x] Tài khoản test được tạo thành công
- [x] Đăng nhập thành công
- [x] Không còn lỗi 400 Bad Request
- [x] Ứng dụng hoạt động bình thường

---

**Cập nhật:** Tài khoản test đã sẵn sàng sử dụng. Lỗi 400 Bad Request đã được khắc phục!