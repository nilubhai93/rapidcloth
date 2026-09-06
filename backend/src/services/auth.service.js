import User from '../models/User.js';
import BankDetail from '../models/BankDetail.js';
import { generateTokens, generateRefreshToken } from '../middleware/auth.js';
import crypto from 'crypto';
import { sendSms } from './sms.service.js';

/**
 * Register a new user with optional delivery profile & zones
 */
export const registerUser = async ({
  name,
  email,
  password,
  phone,
  role = 'user',
  vehicleType,
  vehicleNumber,
  zone,
  zoneId,
  state
}) => {
  if (!name || !email || !password) {
    const error = new Error('Please fill in all required fields.');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  const validRole = ['user', 'seller', 'delivery', 'admin'].includes(role) ? role : 'user';
  const selectedZoneId = zoneId || zone || null;

  const userData = {
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || '',
    role: validRole,
    zone: selectedZoneId,
    assignedZones: selectedZoneId ? [selectedZoneId] : []
  };

  if (validRole === 'delivery') {
    userData.deliveryProfile = {
      isOnline: false,
      vehicleType: vehicleType || 'Bike',
      vehicleNumber: vehicleNumber || '',
      state: state || ''
    };
  }

  const user = await User.create(userData);
  const tokens = generateTokens(user);
  user.activeRefreshTokens.push(tokens.refreshToken);
  await user.save();

  const populatedUser = await User.findById(user._id)
    .select('-password -chatHistory')
    .populate('assignedZones')
    .populate('zone');

  return {
    tokens,
    token: tokens.accessToken, // Backward compatibility
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: populatedUser ? populatedUser.toJSON() : user.toJSON()
  };
};

/**
 * Authenticate user with email and password
 */
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens(user);
  user.activeRefreshTokens.push(tokens.refreshToken);
  await user.save();

  const populatedUser = await User.findById(user._id)
    .select('-password -chatHistory')
    .populate('assignedZones')
    .populate('zone');

  return {
    tokens,
    token: tokens.accessToken, // Backward compatibility
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: populatedUser ? populatedUser.toJSON() : user.toJSON()
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshUserToken = async (refreshToken) => {
  return await generateRefreshToken(refreshToken);
};

/**
 * Generate and dispatch 6-digit OTP via SMS
 */
export const sendUserOtp = async (phone) => {
  if (!phone) {
    const error = new Error('Phone number is required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ phone });
  if (!user) {
    const error = new Error('Account not found with this phone number. Please sign up.');
    error.statusCode = 404;
    throw error;
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  const message = `Your RapidCloth login code is: ${otp}. It will expire in 5 minutes.`;
  await sendSms(phone, message);

  return { phone };
};

/**
 * Verify 6-digit OTP and generate session tokens
 */
export const verifyUserOtp = async ({ phone, otp }) => {
  const user = await User.findOne({
    phone, 
    otp,
    otpExpires: { $gt: Date.now() }
  });

  if (!user) {
    const error = new Error('Invalid or expired OTP.');
    error.statusCode = 401;
    throw error;
  }

  user.otp = null;
  user.otpExpires = null;
  
  const tokens = generateTokens(user);
  user.activeRefreshTokens.push(tokens.refreshToken);
  await user.save();

  return {
    tokens,
    token: tokens.accessToken,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user
  };
};

/**
 * Log out user by revoking refresh token
 */
export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await User.updateOne(
      { activeRefreshTokens: refreshToken },
      { $pull: { activeRefreshTokens: refreshToken } }
    );
  }
};

/**
 * Get profile details of authenticated user
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password -chatHistory')
    .populate('assignedZones')
    .populate('zone');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Update basic profile fields
 */
export const updateUserProfile = async (userId, { name, phone, addresses, sizeProfile, stylePreferences }) => {
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (addresses) updates.addresses = addresses;
  if (sizeProfile) updates.sizeProfile = sizeProfile;
  if (stylePreferences) updates.stylePreferences = stylePreferences;

  const user = await User.findByIdAndUpdate(userId, updates, { new: true })
    .select('-password -chatHistory')
    .populate('assignedZones')
    .populate('zone');

  return user;
};

/**
 * Update user fashion size profile
 */
export const updateUserSizeProfile = async (userId, { topSize, bottomSize, shoeSize, preferredBrands }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { sizeProfile: { topSize, bottomSize, shoeSize, preferredBrands } },
    { new: true }
  ).select('-password');

  return user;
};

/**
 * Retrieve user bank details
 */
export const getUserBankDetails = async (userId) => {
  const details = await BankDetail.findOne({ userId });
  return details;
};

/**
 * Upsert user bank account details
 */
export const updateUserBankDetails = async (userId, { accountHolderName, accountNumber, bankName, ifscCode, branchName }) => {
  let details = await BankDetail.findOne({ userId });
  if (details) {
    details.accountHolderName = accountHolderName;
    details.accountNumber = accountNumber;
    details.bankName = bankName;
    details.ifscCode = ifscCode;
    details.branchName = branchName;
    await details.save();
  } else {
    details = await BankDetail.create({
      userId,
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode,
      branchName
    });
  }

  return details;
};
