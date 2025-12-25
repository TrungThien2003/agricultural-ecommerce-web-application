const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers.js");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware.js");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.post("/refresh-token", userController.refreshToken);
router.get("/sign-out", userController.signOut);

router.get("/details/:id", authMiddleware, userController.getDetails);
router.put("/:id", authMiddleware, userController.updateUser);
router.post(
  "/sign-up-admin",
  authMiddleware,
  adminMiddleware,
  userController.createUser4Admin
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  userController.deleteUser
);
router.get(
  "/get-all",
  authMiddleware,
  adminMiddleware,
  userController.getAllUsers
);

module.exports = router;
