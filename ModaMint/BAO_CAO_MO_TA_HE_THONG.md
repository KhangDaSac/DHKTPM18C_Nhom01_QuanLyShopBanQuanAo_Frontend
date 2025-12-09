# BÁO CÁO MÔ TẢ HỆ THỐNG WEBSITE MODAMINT

## 1. TỔNG QUAN HỆ THỐNG
**Dự án:** ModaMint - Website Thương mại điện tử thời trang.
**Công nghệ:**
- **Frontend:** ReactJS, TypeScript, Vite.
- **UI Framework:** Ant Design (cho Admin), CSS Modules/Custom CSS (cho Client).
- **State Management:** React Context API, React Hooks.
- **Routing:** React Router DOM.
- **API Client:** Axios.

---

## 2. PHÂN HỆ WEB KHÁCH HÀNG (CLIENT)

### 2.1. Trang Chủ (Home Page)
*Mục đích:* Là điểm chạm đầu tiên, giới thiệu thương hiệu và thúc đẩy mua sắm.
*Chức năng chi tiết:*
- **Banner Quảng Cáo & Chính Sách:** Hiển thị banner lớn về chương trình khuyến mãi và các cam kết (Giao hàng, đổi trả, hỗ trợ).
- **Danh Mục Nổi Bật:** Liệt kê các danh mục sản phẩm chính để truy cập nhanh.
- **Khuyến Mãi (Carousel):** Hiển thị các mã giảm giá, voucher đang hiệu lực.
- **Bộ Sưu Tập (Collections):** Khu vực riêng cho Thời trang Nam và Nữ.
- **Sản Phẩm Gợi Ý:**
    - "Sản phẩm đặc biệt": Các sản phẩm đang giảm giá hoặc cần đẩy hàng.
    - "Gợi ý hôm nay": Danh sách sản phẩm ngẫu nhiên hoặc theo xu hướng.
- **Đánh Giá Khách Hàng:** Hiển thị feedback thực tế từ người mua.

### 2.2. Trang Danh Sách Sản Phẩm (Product Listing)
*Mục đích:* Tìm kiếm và lọc sản phẩm.
*Chức năng chi tiết:*
- **Bộ Lọc Đa Chiều (Filter Sidebar):**
    - Theo Danh mục, Thương hiệu.
    - Theo Khoảng giá.
    - Theo Màu sắc, Kích thước.
- **Sắp Xếp (Sorting):** Theo tên (A-Z) hoặc giá (Thấp-Cao).
- **Thẻ Sản Phẩm (Product Card):** Hiển thị ảnh, tên, giá gốc/giảm, nhãn giảm giá, nút thêm nhanh vào giỏ.
- **Phân Trang:** Hỗ trợ xem danh sách lớn sản phẩm.

### 2.3. Trang Chi Tiết Sản Phẩm (Product Detail)
*Mục đích:* Xem thông tin chi tiết và ra quyết định mua hàng.
*Chức năng chi tiết:*
- **Thư Viện Ảnh (Gallery):** Xem ảnh chi tiết, zoom ảnh.
- **Chọn Biến Thể:** Lựa chọn Màu sắc và Size (hệ thống tự động kiểm tra tồn kho cho từng biến thể).
- **Thông Tin:** Giá bán, mô tả chi tiết, thông số kỹ thuật.
- **Hành Động:**
    - "Thêm vào giỏ": Chọn mua nhưng vẫn tiếp tục xem.
    - "Mua ngay": Chuyển thẳng đến thanh toán.
    - "Yêu thích": Lưu sản phẩm để xem sau.
- **Bảng Size (Size Chart):** Hướng dẫn chọn kích cỡ.

### 2.4. Trang Giỏ Hàng & Thanh Toán (Cart & Checkout)
*Mục đích:* Xử lý đơn hàng.
*Chức năng chi tiết:*
- **Giỏ Hàng:**
    - Xem lại sản phẩm, giá, số lượng.
    - Tăng/giảm số lượng hoặc xóa sản phẩm.
    - Hiển thị tổng tiền tạm tính.
    - Lưu giỏ hàng cho cả khách vãng lai (Guest) và thành viên.
- **Thanh Toán (Checkout):**
    - **Thông Tin Giao Hàng:**
        - **Khách vãng lai (Guest):** Form nhập thông tin chi tiết gồm Họ tên, SĐT, Email và Địa chỉ. Hỗ trợ chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã từ danh sách tự động (API Address).
        - **Thành viên (Member):** Tự động điền địa chỉ mặc định hoặc cho phép chọn nhanh từ Sổ địa chỉ đã lưu.
    - **Mã Giảm Giá (Voucher):**
        - Ô nhập mã khuyến mãi với tính năng kiểm tra tính hợp lệ tức thì.
        - Hiển thị rõ số tiền được giảm nếu mã hợp lệ (theo % hoặc số tiền cố định).
    - **Phương Thức Thanh Toán:**
        - Hỗ trợ đa dạng: Thanh toán khi nhận hàng (COD) hoặc Chuyển khoản trực tuyến (VNPay, Ví điện tử).
    - **Tóm Tắt Đơn Hàng:** Hiển thị lại danh sách sản phẩm, tạm tính, phí vận chuyển, giảm giá và Tổng thanh toán cuối cùng.

### 2.5. Trang Tài Khoản & Quản Lý Đơn Hàng (User Profile)
*Mục đích:* Trung tâm quản lý thông tin cá nhân và theo dõi đơn hàng của người dùng.
*Chức năng chi tiết:*
- **Thông Tin Cá Nhân (Profile Dashboard):**
    - **Tổng quan:** Hiển thị Avatar, Họ tên, Email và các liên kết nhanh.
    - **Cập nhật hồ sơ:** Cho phép thay đổi ảnh đại diện (Upload ảnh), cập nhật Họ tên, Số điện thoại, Ngày sinh.
- **Quản Lý Đơn Hàng (Order History):**
    - **Danh sách đơn hàng:** Hiển thị lịch sử mua hàng với đầy đủ thông tin: Mã đơn, Ngày đặt, Phương thức thanh toán, Tổng tiền.
    - **Trạng thái đơn hàng:** Theo dõi quy trình xử lý đơn qua các tab trạng thái: Chờ xác nhận, Đang chuẩn bị, Đang giao, Đã giao, Đã hủy.
    - **Tính năng đặc biệt:**
        - **Hủy đơn hàng:** Cho phép người dùng tự hủy đơn khi đơn hàng đang ở trạng thái "Chờ xác nhận".
        - **Thanh toán lại (VNPay):** Hỗ trợ tiếp tục thanh toán cho các đơn hàng chuyển khoản chưa hoàn tất (có đếm ngược thời gian hết hạn 15 phút).
        - **Xem chi tiết:** Truy cập trang chi tiết đơn hàng để xem danh sách sản phẩm, biến thể đã chọn và lộ trình vận chuyển.
- **Sổ Địa Chỉ (Address Book):**
    - Quản lý danh sách nhiều địa chỉ giao hàng.
    - Các thao tác: Thêm địa chỉ mới (chọn Tỉnh/Thành, Quận/Huyện, Phường/Xã), Sửa, Xóa.
    - **Thiết lập mặc định:** Chọn một địa chỉ làm mặc định để tự động điền khi thanh toán.
- **Bảo Mật (Change Password):**
    - Form đổi mật khẩu bảo mật.
    - Yêu cầu nhập mật khẩu hiện tại, mật khẩu mới và xác nhận (có kiểm tra độ mạnh của mật khẩu).

---

## 3. PHÂN HỆ QUẢN TRỊ (ADMIN DASHBOARD)

### 3.1. Tổng Quan Doanh Số (Dashboard Analytics)
*Chức năng chi tiết:*
- **Thống Kê Hiệu Suất:** Biểu đồ doanh thu và số lượng đơn hàng.
- **Bộ Lọc Thời Gian:** Xem báo cáo theo "30 ngày gần nhất" hoặc "Theo tháng".
- **Lazy Loading:** Tối ưu hóa hiệu năng tải biểu đồ dữ liệu lớn.

### 3.2. Quản Lý Đơn Hàng (Order Management)
*Chức năng chi tiết:*
- **Danh Sách Đơn Hàng:** Xem tất cả đơn hàng với trạng thái (Chờ xác nhận, Đang giao, Đã giao, Hủy...).
- **Chi Tiết Đơn Hàng:**
    - Thông tin khách hàng, địa chỉ giao hàng.
    - Danh sách sản phẩm trong đơn, biến thể (Màu/Size).
    - Tổng tiền, phí ship, giảm giá.
    - **Lịch sử trạng thái (Timeline):** Theo dõi quá trình xử lý đơn hàng theo thời gian thực (Ai cập nhật, lúc nào).
- **Thao Tác:** Cập nhật trạng thái đơn (Duyệt, Giao hàng...), in hóa đơn, xuất Excel.

### 3.3. Quản Lý Sản Phẩm (Product Management)
*Chức năng chi tiết:*
- **Danh Sách Sản Phẩm:** Hiển thị hình ảnh, tên, giá, tồn kho, trạng thái.
- **Quản Lý Biến Thể (Product Variants):**
    - Quản lý chi tiết từng biến thể (Màu Xanh - Size L, Màu Đỏ - Size M...).
    - Thiết lập giá riêng và số lượng tồn kho cho từng biến thể.
    - Upload ảnh riêng cho từng biến thể.
- **Thêm/Sửa Sản Phẩm:** Form nhập liệu chi tiết, upload nhiều ảnh, gắn danh mục/thương hiệu.
- **Ẩn/Hiện Sản Phẩm:** Vô hiệu hóa sản phẩm thay vì xóa vĩnh viễn (Soft Delete) để bảo toàn dữ liệu lịch sử đơn hàng.
- **Xuất Excel:** Báo cáo danh mục sản phẩm.

### 3.4. Quản Lý Khách Hàng (Customer Management)
*Chức năng chi tiết:*
- **Hồ Sơ Khách Hàng:** Xem thông tin cá nhân, lịch sử mua hàng, tổng chi tiêu.
- **Tra Cứu:** Tìm kiếm khách hàng theo Tên, Email, SĐT.
- **Trạng Thái:** Khóa/Mở khóa tài khoản khách hàng.
- **Thống Kê:** Tổng số khách hàng, khách hàng mới.

### 3.5. Quản Lý Khuyến Mãi (Promotion Management)
*Chức năng chi tiết:*
- **Loại Khuyến Mãi:**
    - **Theo Phần Trăm (%):** Giảm giá theo % giá trị đơn hàng.
    - **Theo Số Tiền (Amount):** Giảm số tiền cố định trực tiếp.
- **Cấu Hình Khuyến Mãi:**
    - Mã code (Voucher).
    - Mức giảm.
    - Giá trị đơn tối thiểu được áp dụng.
    - Thời gian bắt đầu - kết thúc.
    - Số lượng mã giới hạn.
- **Trạng Thái:** Kích hoạt hoặc tạm dừng chương trình khuyến mãi.
