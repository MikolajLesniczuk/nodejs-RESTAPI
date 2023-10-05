const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../authorizarion/auth.midleware");
const {
  register,
  login,
  logout,
  getCurrentUser,
} = require("../authorizarion/auth.controler");

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/current", authMiddleware, getCurrentUser);

module.exports = router;
