// routes/authRoutes.js
const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword       
} = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateForgetPassword,
  validateResetPassword,
  verifyToken
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/forget-password", validateForgetPassword, forgetPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

// Protected routes (require authentication)
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, validateProfileUpdate, updateProfile);
router.put("/change-password", verifyToken, validateChangePassword, changePassword);

module.exports = router;