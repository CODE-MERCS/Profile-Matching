// controllers/authController.js
const authService = require('../services/authService');

// Register function
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const result = await authService.registerUser({ name, email, phone, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific service errors
    if (error.message === 'USER_EXISTS') {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });

  } catch (error) {
    console.error('Login error:', error);

    // Handle specific service errors
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone } = req.body;

    const user = await authService.updateUser(userId, { name, phone });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Change password error:', error);

    // Handle specific service errors
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (error.message === 'INVALID_OLD_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forget password - send reset link
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await authService.createPasswordReset(email);
    
    // Send reset email
    await authService.sendPasswordResetEmail(email, result.resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email'
    });

  } catch (error) {
    console.error('Forget password error:', error);

    if (error.message === 'USER_NOT_FOUND') {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    if (error.message === 'EMAIL_SEND_FAILED') {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Reset password error:', error);

    if (error.message === 'INVALID_OR_EXPIRED_TOKEN') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword
};