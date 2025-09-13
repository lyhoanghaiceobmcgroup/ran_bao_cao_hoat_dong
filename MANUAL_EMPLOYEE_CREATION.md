# Hướng dẫn Tạo Tài khoản Nhân viên Thủ công

## Tổng quan

Do gặp vấn đề với việc tạo tài khoản tự động qua API, chúng ta sẽ tạo tài khoản nhân viên theo cách thủ công qua Supabase Studio.

## Danh sách Tài khoản cần tạo

| STT | Họ tên | Email | Mật khẩu |
|-----|--------|-------|----------|
| 1 | Lành An Khang | khangthitbo123@gmail.com | 0865154423 |
| 2 | LÊ QUỐC BẢO | lequocbao240107@gmail.com | 0832041111 |
| 3 | Nguyễn lan phương | lanphuongbe110207@gmail.com | 0385658335 |
| 4 | ĐỨC ANH | tducanh2002lc@gmail.com | 0828888598 |
| 5 | Võ Lê phương | volephuong3502@gmail.com | 0945373568 |
| 6 | Vũ thanh tùng | Thanhtung.themask@gmail.com | 0942246586 |
| 7 | Mai khương duy | Mkd1272019@gmail.com | 0335103153 |

## BƯỚC 1: Tạo Auth Users trong Supabase Studio

### 1.1 Truy cập Supabase Studio

1. Mở trình duyệt và truy cập: https://supabase.com/dashboard
2. Đăng nhập vào tài khoản Supabase
3. Chọn project: **bhewlutzthgxcgcmyizy** (RAN Shift Sync)

### 1.2 Tạo từng tài khoản

1. Vào **Authentication** > **Users**
2. Nhấn nút **"Add user"**
3. Điền thông tin cho từng tài khoản:

#### Tài khoản 1: Lành An Khang
- **Email**: `khangthitbo123@gmail.com`
- **Password**: `0865154423`
- **Email Confirm**: ✅ (tick vào)
- Nhấn **"Create user"**

#### Tài khoản 2: LÊ QUỐC BẢO
- **Email**: `lequocbao240107@gmail.com`
- **Password**: `0832041111`
- **Email Confirm**: ✅ (tick vào)
- Nhấn **"Create user"**

#### Tài khoản 3: Nguyễn lan phương
- **Email**: `lanphuongbe110207@gmail.com`
- **Password**: `0385658335`
- **Email Confirm**: ✅ (tick vào)
- Nhấn **"Create user"**

#### Tài khoản 4: ĐỨC ANH
- **Email**: `tducanh2002lc@gmail.com`
- **Password**: `0828888598`
- **Email Confirm**: ✅ (tick vào)
- Nhấn **"Create user"**

#### Tài khoản 5: Võ Lê phương
- **Email**: `volephuong3502@gmail.com`
- **Password**: `0945373568`
- **Email Confirm**: ✅ (tick vào)
- Nhấn **"Create user"**

#### Tài khoản 6: Vũ thanh tùng
- **Email**: `Thanhtung.themask@gmail.com`
- **Password**: `0942246586`
- **Email Confirm**: ✅ (tick vào)
- Nhấn **"Create user"**

#### Tài khoản 7: Mai khương duy
- **Email**: `Mkd1272019@gmail.com`
- **Password**: `0335103153`
- **Email Confirm**: ✅ (tick vào)
- Nhấn **"Create user"**

### 1.3 Kiểm tra tài khoản đã tạo

Sau khi tạo xong, bạn sẽ thấy 7 users mới trong danh sách **Authentication > Users**.

## BƯỚC 2: Tạo Profiles cho Nhân viên

### 2.1 Mở SQL Editor

1. Trong Supabase Studio, vào **SQL Editor**
2. Nhấn **"New query"**

### 2.2 Chạy Script tạo Profiles

1. Mở file `create_employee_profiles_only.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Nhấn **"Run"** để thực thi

### 2.3 Kiểm tra kết quả

Script sẽ hiển thị:
- Thông báo tạo profile cho từng nhân viên
- Bảng kết quả với thông tin các profile đã tạo

Kết quả mong đợi:
```
NOTICE: Created/Updated profile for: Lành An Khang (khangthitbo123@gmail.com)
NOTICE: Created/Updated profile for: LÊ QUỐC BẢO (lequocbao240107@gmail.com)
...
```

## BƯỚC 3: Kiểm tra và Test

### 3.1 Kiểm tra trong Database

1. Vào **Table Editor** > **profiles**
2. Kiểm tra có 7 records mới với:
   - `role_name = 'staff'`
   - `branch = 'HN35,HN40'`
   - `status = 'approved'`

### 3.2 Test đăng nhập

1. Mở ứng dụng: http://localhost:8080/
2. Thử đăng nhập với một tài khoản:
   - **Email**: `khangthitbo123@gmail.com`
   - **Password**: `0865154423`

### 3.3 Kiểm tra quyền truy cập

Sau khi đăng nhập thành công:
1. Nhân viên sẽ thấy trang chọn Dashboard
2. Có thể truy cập **HN35 Dashboard**
3. Có thể truy cập **HN40 Dashboard**
4. Có thể tạo báo cáo bắt đầu ca và kết thúc ca

## BƯỚC 4: Phân phối Tài khoản

### 4.1 Thông tin đăng nhập cho Nhân viên

Gửi thông tin đăng nhập cho từng nhân viên:

**Lành An Khang:**
- Website: http://localhost:8080/ (hoặc domain production)
- Email: khangthitbo123@gmail.com
- Mật khẩu: 0865154423
- Quyền: Truy cập báo cáo HN35 và HN40

**LÊ QUỐC BẢO:**
- Website: http://localhost:8080/
- Email: lequocbao240107@gmail.com
- Mật khẩu: 0832041111
- Quyền: Truy cập báo cáo HN35 và HN40

*(Tương tự cho các nhân viên khác)*

### 4.2 Hướng dẫn sử dụng cho Nhân viên

1. **Đăng nhập**: Truy cập website và đăng nhập bằng email/mật khẩu
2. **Chọn Dashboard**: Chọn HN35 hoặc HN40 tùy theo ca làm việc
3. **Tạo báo cáo**: 
   - Báo cáo bắt đầu ca: Điền thông tin khi bắt đầu ca
   - Báo cáo kết thúc ca: Điền thông tin khi kết thúc ca
4. **Gửi báo cáo**: Báo cáo sẽ được gửi tự động qua Telegram

## Troubleshooting

### Lỗi: "User already exists"

**Nguyên nhân**: Email đã được sử dụng.

**Giải pháp**: 
1. Kiểm tra danh sách users hiện có
2. Nếu user đã tồn tại, chỉ cần chạy script tạo profile
3. Hoặc xóa user cũ và tạo lại

### Lỗi: "Cannot create profile"

**Nguyên nhân**: Auth user chưa được tạo hoặc email không khớp.

**Giải pháp**:
1. Đảm bảo đã tạo auth user trước
2. Kiểm tra email trong script khớp với email trong auth.users
3. Chạy lại script tạo profile

### Lỗi đăng nhập: "Invalid credentials"

**Nguyên nhân**: Sai email hoặc mật khẩu.

**Giải pháp**:
1. Kiểm tra lại email và mật khẩu
2. Đảm bảo "Email Confirm" đã được tick
3. Reset mật khẩu nếu cần

### Không thể truy cập Dashboard

**Nguyên nhân**: Profile chưa được tạo hoặc chưa được approve.

**Giải pháp**:
1. Kiểm tra profile trong table editor
2. Đảm bảo `status = 'approved'`
3. Chạy lại script tạo profile

## Kết luận

Sau khi hoàn thành các bước trên, bạn sẽ có:

✅ **7 tài khoản nhân viên** đã được tạo và kích hoạt
✅ **Quyền truy cập** vào cả HN35 và HN40 Dashboard
✅ **Khả năng tạo báo cáo** ca làm việc
✅ **Tự động gửi báo cáo** qua Telegram

Tất cả nhân viên có thể bắt đầu sử dụng hệ thống ngay lập tức.