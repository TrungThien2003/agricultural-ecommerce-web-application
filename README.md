# 🌾 AgriShop - Hệ thống Thương mại điện tử Nông sản

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white" />
</p>

**AgriShop** là nền tảng thương mại điện tử chuyên biệt cho nông sản sạch. Hệ thống tích hợp **Trí tuệ nhân tạo (Gemini AI)** tư vấn thông minh và **Socket.io** hỗ trợ khách hàng theo thời gian thực.

---

## 📺 Demo giao diện

| Trang chủ (Client) | Dashboard (Admin) |
| :---: | :---: |
| <img src="https://via.placeholder.com/400x200?text=Giao+dien+Client" width="400" /> | <img src="https://via.placeholder.com/400x200?text=Giao+dien+Admin" width="400" /> |

---

## ✨ Tính năng chính

### 👤 Cho Khách hàng (Client)
- 🛒 **Mua sắm:** Tìm kiếm, lọc sản phẩm theo danh mục và nhà cung cấp.
- 💳 **Thanh toán:** Giỏ hàng thông minh và tích hợp cổng thanh toán trực tuyến.
- 💬 **Hỗ trợ Realtime:** Chat trực tiếp với Admin qua Socket.io.
- 🤖 **AI Bot:** Tự động trả lời thắc mắc sản phẩm nhờ Google Gemini AI.
- 📋 **Đơn hàng:** Theo dõi trạng thái đơn hàng và lịch sử mua sắm.

### 🔐 Cho Quản trị viên (Admin)
- 📊 **Thống kê:** Dashboard theo dõi doanh thu, số lượng đơn hàng và người dùng.
- 📦 **Quản lý kho:** CRUD (Thêm, sửa, xóa) Sản phẩm, Danh mục, Nhà cung cấp.
- 👥 **Quản lý User:** Phân quyền và kiểm soát danh sách người dùng.
- 🎧 **Trung tâm hỗ trợ:** Giao diện chat tập trung để trả lời khách hàng.

---

## 🛠 Công nghệ sử dụng

- **Frontend:** React.js, Redux, Tailwind CSS, Ant Design.
- **Backend:** Node.js (Express), Socket.io, JWT Authentication.
- **Database:** MongoDB & Mongoose.
- **AI Integration:** Google Generative AI (Gemini Model).
---

🚀 Hướng dẫn cài đặt
1. Cấu hình Backend
Di chuyển vào thư mục backend và tạo file .env:

Bash

cd backend
npm install
Nội dung file .env:

Đoạn mã

PORT=3003
MONGO_DB=mongodb+srv://your_url
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
GEMINI_API_KEY=your_key
Chạy server: npm start

2. Cấu hình Frontend
Bash

cd ../frontend
npm install
npm start

