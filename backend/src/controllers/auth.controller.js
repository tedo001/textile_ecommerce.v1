const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ name, email, password });
  const token = signToken(user);
  res.status(201).json({ token, user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const token = signToken(user);
  res.json({ token, user });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  if (!googleClient) throw new ApiError(500, 'Google login is not configured');
  const { idToken } = req.body;
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new ApiError(401, 'Invalid Google token');

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      avatar: payload.picture,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.avatar = user.avatar || payload.picture;
    await user.save();
  }
  const token = signToken(user);
  res.json({ token, user });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = (({ name, avatar, addresses }) => ({ name, avatar, addresses }))(req.body);
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ user });
});
