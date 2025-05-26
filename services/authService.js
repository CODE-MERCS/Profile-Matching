const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { transporter } = require('../configs/nodemailer');

const prisma = new PrismaClient();

class AuthService {
  
  // Generate JWT Token
  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  }

  // Generate reset token
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Check if user exists by email
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  // Create new user
  async createUser(userData) {
    const { name, email, phone, password } = userData;
    
    // Hash password
    const hashedPassword = await this.hashPassword(password);
    
    // Create user with default role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'admin' // Default role
      }
    });

    return user;
  }

  // Register user business logic
  async registerUser(userData) {
    const { name, email, phone, password } = userData;

    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('USER_EXISTS');
    }

    // Create new user
    const user = await this.createUser({ name, email, phone, password });

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  // Login user business logic
  async loginUser(loginData) {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  // Get user by ID
  async getUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      } else {
        throw new Error('TOKEN_ERROR');
      }
    }
  }

  // Update user profile
  async updateUser(userId, updateData) {
    const { name, phone } = updateData;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Verify old password
    const isOldPasswordValid = await this.comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error('INVALID_OLD_PASSWORD');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { message: 'Password changed successfully' };
  }

  // Create password reset request
  async createPasswordReset(email) {
    // Check if user exists
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Delete any existing reset tokens for this email
    await prisma.passwordReset.deleteMany({
      where: { email: user.email }
    });

    // Store reset token in database
    await prisma.passwordReset.create({
      data: {
        email: user.email,
        token: resetToken,
        expiresAt: resetTokenExpiry,
        used: false
      }
    });

    return {
      resetToken,
      email: user.email,
      expiresAt: resetTokenExpiry
    };
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, you can also copy and paste this link into your browser:
            <br><a href="${resetLink}">${resetLink}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, message: 'Reset email sent successfully' };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('EMAIL_SEND_FAILED');
    }
  }

  // Verify reset token
  async verifyResetToken(token) {
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!resetRequest) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    return resetRequest;
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    // Verify reset token
    const resetRequest = await this.verifyResetToken(token);

    // Get user
    const user = await this.findUserByEmail(resetRequest.email);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password and mark token as used
    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true }
      })
    ]);

    return { message: 'Password reset successfully' };
  }

  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new AuthService();