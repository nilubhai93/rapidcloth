import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rapidcloth_secret_jwt_token_auth_key_2024_xyz';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_secret_secure_key_2024`;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate both accessToken and refreshToken for a given user
 * @param {Object} user - User document or object with _id, role, email
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
export const generateTokens = (user) => {
  const userId = user._id ? user._id.toString() : user.id || user.userId;
  const payload = {
    id: userId,
    userId,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });

  const refreshToken = jwt.sign(
    { userId, role: user.role, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  };
};

/**
 * Verify an access token (supports both direct token verification and Express middleware usage)
 * @param {string|Object} tokenOrReq
 * @param {Object} [res]
 * @param {Function} [next]
 * @returns {Object|void} decoded payload if called as function
 */
export const verifyAccessToken = (tokenOrReq, res, next) => {
  if (tokenOrReq && typeof tokenOrReq === 'object' && tokenOrReq.headers && typeof next === 'function') {
    return authenticate(tokenOrReq, res, next);
  }
  return jwt.verify(tokenOrReq, JWT_SECRET);
};

/**
 * Generate a new access token (and fresh refresh token) using a valid refresh token
 * @param {string} refreshToken
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export const generateRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error(err.name === 'TokenExpiredError' ? 'Refresh token expired. Please login again.' : 'Invalid refresh token.');
    error.statusCode = 401;
    throw error;
  }

  let user = null;
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.userId).select('-password');
    }
  } catch (dbErr) {
    // If DB is offline or in non-mongo test environment
  }

  if (!user) {
    const error = new Error('User associated with refresh token not found');
    error.statusCode = 401;
    throw error;
  }

  // Check if token is valid and hasn't been reused
  if (!user.activeRefreshTokens.includes(refreshToken)) {
    // Possible theft detected! Someone tried to use an already consumed or invalid token.
    user.activeRefreshTokens = []; // Log out from all devices
    await user.save();
    const error = new Error('Security alert: Refresh token reuse detected. You have been logged out.');
    error.statusCode = 401;
    throw error;
  }

  // Remove the old used token
  user.activeRefreshTokens = user.activeRefreshTokens.filter(t => t !== refreshToken);

  // Generate new tokens
  const tokens = generateTokens(user);
  
  // Save new refresh token
  user.activeRefreshTokens.push(tokens.refreshToken);
  await user.save();

  return {
    ...tokens,
    user
  };
};

/**
 * Authenticate incoming request via Bearer JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const userId = decoded.userId || decoded.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please refresh token or login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Optional authentication middleware - populates req.user if token is present, does not block if not
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.userId).select('-password');
  } catch (e) {
    // Continue without auth
  }
  next();
};

/**
 * Role authorization middleware factory
 * @param  {...string|string[]} roles - Allowed roles (e.g. 'admin', 'superadmin', 'seller', 'delivery', 'user')
 */
export const authorize = (...roles) => {
  // Flatten in case array passed as authorize(['admin', 'superadmin'])
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

/**
 * Legacy role guards preserved for backward compatibility
 */
export const adminOnly = authorize('admin', 'superadmin');
export const superAdminOnly = authorize('superadmin');
export const isSuperAdmin = superAdminOnly;
export const sellerOrAdmin = authorize('seller', 'admin', 'superadmin');
