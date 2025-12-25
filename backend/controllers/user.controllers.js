const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  generalAccessToken,
  generalRefreshToken,
} = require("./Services/jwtTokenService");

const createUser = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword } = req.body;
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (
      !fullname ||
      !email ||
      !password ||
      !confirmPassword ||
      !regexEmail.test(email) ||
      password !== confirmPassword
    ) {
      return res.status(400).json({
        status: "Error",
        message: "Dữ liệu không hợp lệ hoặc mật khẩu không khớp",
      });
    }

    const isExitedUser = await User.findOne({ email });
    if (isExitedUser) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email đã tồn tại" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      status: "Ok",
      message: "Đăng ký thành công",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

const createUser4Admin = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, address, isAdmin } =
      req.body;
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "Error",
        message:
          "Vui lòng nhập đầy đủ: Tên, Email, Mật khẩu và Xác nhận mật khẩu",
      });
    }

    if (!regexEmail.test(email)) {
      return res.status(400).json({
        status: "Error",
        message: "Định dạng Email không hợp lệ",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "Error",
        message: "Mật khẩu xác nhận không trùng khớp",
      });
    }

    const isExitedUser = await User.findOne({ email: email });
    if (isExitedUser) {
      return res.status(400).json({
        status: "Error",
        message: "Email này đã tồn tại trên hệ thống",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      address: address || "",
      isAdmin: isAdmin || false,
    });

    return res.status(201).json({
      status: "Success",
      message: "Admin đã tạo người dùng thành công",
      data: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        address: newUser.address,
      },
    });
  } catch (error) {
    console.error("Lỗi tại createUser4Admin:", error);
    return res.status(500).json({
      status: "Error",
      message: "Lỗi hệ thống khi Admin tạo người dùng",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Error", message: "Email không tồn tại" });
    }

    const comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return res
        .status(401)
        .json({ status: "Error", message: "Mật khẩu không chính xác" });
    }

    // Tạo Tokens
    const accessToken = await generalAccessToken({
      id: user.id,
      isAdmin: user.isAdmin,
      fullname: user.fullname,
      email: user.email,
    });

    const refreshToken = await generalRefreshToken({
      id: user.id,
      isAdmin: user.isAdmin,
    });

    // Lưu Refresh Token vào Cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false, // Để true nếu dùng https
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "Ok",
      message: "Đăng nhập thành công",
      access_token: accessToken,
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ status: "Error", message: "Id là bắt buộc" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "Error", message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      status: "Ok",
      message: "Cập nhật thành công",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: "Error", message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      status: "Ok",
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { limit = 10, page = 0, name, email, address } = req.query;
    const query = {};

    if (name) query.fullname = { $regex: name, $options: "i" };
    if (email) query.email = { $regex: email, $options: "i" };
    if (address) query.address = { $regex: address, $options: "i" };

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .limit(Number(limit))
      .skip(Number(limit) * Number(page))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "Ok",
      data: users,
      currentPage: Number(page) + 1,
      totalPage: Math.ceil(count / limit),
      totalUsers: count,
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ status: "Error", message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      status: "Ok",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

const signOut = (req, res) => {
  res.clearCookie("refresh_token");
  return res.status(200).json({
    status: "Ok",
    message: "Đăng xuất thành công",
  });
};

module.exports = {
  createUser,
  createUser4Admin,
  loginUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getDetails,
  signOut,
};
