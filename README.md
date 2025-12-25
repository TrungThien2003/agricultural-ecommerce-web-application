# 🌾 AgriShop - Hệ thống Thương mại điện tử Nông sản

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white" />
</p>

**AgriShop** là một nền tảng thương mại điện tử hiện đại chuyên cung cấp nông sản sạch. Dự án được xây dựng với mục tiêu kết nối người nông dân và khách hàng, tích hợp **Trí tuệ nhân tạo (AI)** để tư vấn tự động và hệ thống **Chat Realtime** để hỗ trợ khách hàng tối ưu.

---

## ✨ Tính năng nổi bật

### 👤 Đối với Khách hàng (Client)
- **Mua sắm thông minh:** Tìm kiếm, xem chi tiết và lọc sản phẩm theo danh mục/nhà cung cấp.
- **Thanh toán trực tuyến:** Giỏ hàng tiện lợi, tích hợp quy trình thanh toán nhanh chóng.
- **Chat Realtime:** Trò chuyện trực tiếp với Admin để được giải đáp thắc mắc ngay lập tức.
- **Hỗ trợ AI (Gemini):** Tự động nhận diện sản phẩm và tư vấn khách hàng khi Admin vắng mặt.
- **Lịch sử đơn hàng:** Theo dõi trạng thái và quản lý danh sách các đơn hàng đã mua.

### 🔐 Đối với Quản trị viên (Admin)
- **Dashboard Thống kê:** Theo dõi doanh thu, số lượng đơn hàng và biểu đồ tăng trưởng doanh thu.
- **Quản lý Sản phẩm (CRUD):** Thêm mới, cập nhật thông tin và quản lý tồn kho sản phẩm.
- **Quản lý Danh mục & Nhà cung cấp:** Tổ chức hệ thống phân loại và nguồn cung ứng hàng hóa.
- **Quản lý Người dùng:** Kiểm soát danh sách khách hàng, phân quyền Admin và quản lý tài khoản.
- **Trung tâm Phản hồi:** Hệ thống quản lý hội thoại tập trung, phản hồi khách hàng realtime.

---

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | ReactJS, Redux, Tailwind CSS |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB & Mongoose |
| **Realtime** | Socket.io (WebSockets) |
| **AI Support** | Google Generative AI (Gemini 1.5/2.0 Flash) |

---

## 📂 Cấu trúc thư mục (Monorepo)

```text
.
├── backend/                # Source code Server (API & Socket)
│   ├── controllers/        # Xử lý logic nghiệp vụ
│   ├── models/             # Schema Database MongoDB
│   ├── routes/             # Định nghĩa các Endpoints API
│   ├── middleware/         # Xác thực (JWT) & Phân quyền (Admin)
│   └── .env                # File cấu hình môi trường (Bảo mật)
├── frontend/               # Source code Client (React App)
│   ├── src/pages/          # Giao diện chính (Home, Admin, Cart...)
│   ├── src/components/     # Các thành phần UI dùng chung
│   └── src/redux/          # Quản lý State toàn cục
└── README.md
