// utils/initAdmin.js
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

async function createDefaultAdmin() {
  try {
    const adminEmail = "admin@agrifarm.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("✅ Admin đã tồn tại:", adminEmail);
      return;
    }

    const hashedPassword = await bcrypt.hashSync("Admin@123", 10);

    const newAdmin = new User({
      fullname: "Quản trị viên",
      email: adminEmail,
      password: hashedPassword,
      address: "Trụ sở hệ thống AgriFarm",
      isAdmin: true,
    });

    await newAdmin.save();
    console.log("🌱 Đã tạo tài khoản admin mặc định thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin mặc định:", error);
  }
}

module.exports = createDefaultAdmin;
