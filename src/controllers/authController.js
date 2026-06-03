const authService = require('../services/authService');

const COOKIE_OPTIONS = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: (parseInt(process.env.SESSION_EXPIRY) || 3600) * 1000,
});

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Registration successful.', data: { user } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { sessionId, user } = await authService.login(req.body.email, req.body.password);
    res.cookie('sessionId', sessionId, COOKIE_OPTIONS());
    res.json({ success: true, message: 'Login successful.', data: { user } });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.sessionId);
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

const sessionInfo = async (req, res, next) => {
  try {
    const session = await authService.getSessionInfo(req.sessionId);
    res.json({ success: true, data: { session } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, sessionInfo };
