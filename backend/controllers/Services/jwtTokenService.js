const jwt = require("jsonwebtoken");
require("dotenv").config();

const generalAccessToken = (payload) => {
  const accessToken = jwt.sign(
    { ...payload },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "300m" }
  );
  return accessToken;
};

const generalRefreshToken = (payload) => {
  const refreshToken = jwt.sign(
    { ...payload },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30days" }
  );
  return refreshToken;
};

const jwtRefreshToken = async (token) => {
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET,
        async function (err, user) {
          if (err) {
            return resolve({
              status: "Error",
              message: "Refresh token không hợp lệ hoặc đã hết hạn",
            });
          }

          const access_token = await generalAccessToken({
            id: user.id,
            isAdmin: user.isAdmin,
            fullname: user.fullname,
            email: user.email,
          });

          resolve({
            status: "Ok",
            message: "Đã cấp lại access_token",
            access_token,
          });
        }
      );
    } catch (ex) {
      reject(ex);
    }
  });
};

module.exports = {
  generalAccessToken,
  generalRefreshToken,
  jwtRefreshToken,
};
