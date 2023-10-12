const User = require("./user.model");
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../authorizarion/auth.midleware");
const {
  register,
  login,
  logout,
  getCurrentUser,
  getUsers,
  uploadAvatar,
  verifyHandler,
  resendVerificationHandler,
} = require("./user.controler");
const path = require("path");
const multer = require("multer");

const upload = multer({
  dest: path.join(__dirname, "tmp"),
});

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/current", authMiddleware, getCurrentUser);
router.get("/all", getUsers);
router.patch("/avatars", upload.single("avatar"), uploadAvatar);

router.get("/verify/:verificationToken", verifyHandler);
router.post("/verify", resendVerificationHandler);

module.exports = router;
