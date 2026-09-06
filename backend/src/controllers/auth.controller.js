import {
  registerUser,
  loginUser,
  refreshUserToken,
  sendUserOtp,
  verifyUserOtp,
  getUserProfile,
  updateUserProfile,
  updateUserSizeProfile,
  getUserBankDetails,
  updateUserBankDetails,
  logoutUser
} from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 ,// 7 days (matches refresh token expiry),
  secure:process.env.NODE_ENV === 'production'  
};

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Registration failed. Please try again.',
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Login successful',
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Login failed. Please try again.',
      message: error.message || 'Login failed. Please try again.'
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token provided.' });
    }
    const result = await refreshUserToken(token);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    res.status(error.statusCode || 401).json({
      success: false,
      error: error.message || 'Failed to refresh token.'
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await sendUserOtp(phone)

    res.status(200).json({
     
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to send OTP.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const result = await verifyUserOtp(req.body);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.json({
      message: 'OTP verified successfully',
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Verification failed.' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    await logoutUser(token);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await updateUserProfile(req.user._id, req.body);
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update profile.' });
  }
};

export const updateSizeProfile = async (req, res) => {
  try {
    const user = await updateUserSizeProfile(req.user._id, req.body);
    res.json({ message: 'Size profile updated', user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update size profile.' });
  }
};

export const getBankDetails = async (req, res) => {
  try {
    const details = await getUserBankDetails(req.user._id);
    res.json({ details });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch bank details.' });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const details = await updateUserBankDetails(req.user._id, req.body);
    res.json({ message: 'Bank details updated successfully', details });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update bank details.' });
  }
};
