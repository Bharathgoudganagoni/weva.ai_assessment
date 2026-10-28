const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Sign up a new user and create an organization
 */
async function signup(req, res) {
  try {
    const { email, password, confirmPassword, organizationName, name } = req.body;

    // Validation
    if (!email || !password || !organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and organization name are required.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOrgName = organizationName.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (trimmedOrgName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Organization name must be at least 2 characters.',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create organization and user in an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: trimmedOrgName,
          defaultLowStockThreshold: 5,
        },
      });

      const user = await tx.user.create({
        data: {
          email: trimmedEmail,
          password: hashedPassword,
          name: name ? name.trim() : trimmedEmail.split('@')[0],
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.user.id,
        organizationId: result.organization.id,
        email: result.user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account and organization created successfully.',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        defaultLowStockThreshold: result.organization.defaultLowStockThreshold,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during signup.',
      error: error.message,
    });
  }
}

/**
 * Log in an existing user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user with organization
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organization.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        defaultLowStockThreshold: user.organization.defaultLowStockThreshold,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
      error: error.message,
    });
  }
}

/**
 * Get current authenticated user profile and organization info
 */
async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
      organization: {
        id: req.user.organization.id,
        name: req.user.organization.name,
        defaultLowStockThreshold: req.user.organization.defaultLowStockThreshold,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
      error: error.message,
    });
  }
}

module.exports = {
  signup,
  login,
  getMe,
};
