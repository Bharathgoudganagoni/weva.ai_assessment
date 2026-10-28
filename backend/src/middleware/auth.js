const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'stockflow_default_secret_jwt';

/**
 * Authentication & Tenant Context Middleware
 * Verifies JWT token from Authorization header and injects
 * authenticated user and organization into req.user.
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed authorization token.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user and organization to guarantee account is still active and valid
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
    }

    if (!user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. No associated organization found for this user.',
      });
    }

    // Attach user and organization context to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      organizationId: user.organizationId,
      organization: user.organization,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
      error: error.message,
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
};
