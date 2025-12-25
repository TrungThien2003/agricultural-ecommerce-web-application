const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

const assignUserMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, "access_token");

      const user = await User.findById(decoded.id).select("-password");
      console.log("da co token", user);

      req.user = user;
    } catch (error) {
      console.error(
        "Lỗi xác thực token trong assignUserMiddleware:",
        error.message
      );

      req.user = undefined;
    }
  } else {
    req.user = undefined;
  }

  next();
});

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("token", token);

    try {
      const decoded = jwt.verify(token, "access_token");

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("Người dùng không tồn tại.");
      }

      return next();
    } catch (error) {
      console.error(error.message);
      res.status(401);
      throw new Error("Không được phép, token không hợp lệ hoặc đã hết hạn.");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Không được phép, không tìm thấy token.");
  }
});
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error("Không được phép, yêu cầu quyền Admin.");
  }
};

module.exports = { assignUserMiddleware, authMiddleware, adminMiddleware };
