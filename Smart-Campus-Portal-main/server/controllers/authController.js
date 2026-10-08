const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { signToken } = require('../config/jwt');
const userModel = require('../models/userModel');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const isDomainAllowed = (email) => {
  const rawAllowed = process.env.ALLOWED_EMAIL_DOMAINS || '';
  const allowedList = rawAllowed
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedList.length) return true;

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  return allowedList.includes(domain);
};

const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google identity credential token is required.'
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({
        success: false,
        message: 'Failed to verify Google token with provider.'
      });
    }

    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google profile did not return a valid email address.'
      });
    }

    // Enforce domain restriction on backend
    if (!isDomainAllowed(email)) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted. Please use an authorized institutional email account.'
      });
    }

    let user = await userModel.findByEmail(email);

    if (!user) {
      // First login creates user row defaulting to Student
      const userId = await userModel.createUser({
        fullName: name || 'Student User',
        email,
        googleId,
        avatarUrl: picture || null,
        role: 'Student'
      });

      // Also create a student record with temporary roll number
      const rollNumber = `STU${Date.now().toString().slice(-6)}`;
      await userModel.createStudent({
        userId,
        rollNumber,
        semester: 1,
        batchYear: new Date().getFullYear()
      });

      user = await userModel.findById(userId);
    } else {
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account is currently deactivated. Contact the administrator.'
        });
      }
    }

    const token = signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });

    const fullProfile = await userModel.findFullProfileById(user.user_id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: fullProfile
    });
  } catch (error) {
    next(error);
  }
};

const googleOAuthCallback = async (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Google sign in was aborted.')}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Missing authorization code.')}`);
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Strict domain check in callback
    if (!isDomainAllowed(email)) {
      const errMsg = 'Access restricted. Please sign in with your institutional college email.';
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errMsg)}`);
    }

    let user = await userModel.findByEmail(email);
    if (!user) {
      const userId = await userModel.createUser({
        fullName: name || 'Student User',
        email,
        googleId,
        avatarUrl: picture || null,
        role: 'Student'
      });

      const rollNumber = `STU${Date.now().toString().slice(-6)}`;
      await userModel.createStudent({
        userId,
        rollNumber,
        semester: 1,
        batchYear: new Date().getFullYear()
      });

      user = await userModel.findById(userId);
    } else if (!user.is_active) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Your account is deactivated.')}`);
    }

    const token = signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });

    return res.redirect(`${frontendUrl}/login?token=${token}`);
  } catch (err) {
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Authentication failed: ' + err.message)}`);
  }
};

const loginWithPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact the system administrator.'
      });
    }

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });

    const fullProfile = await userModel.findFullProfileById(user.user_id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: fullProfile
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      rollNumber,
      semester,
      department
    } = req.body;

    // SECURITY: Self-registration ALWAYS creates a Student.
    // Role from request body is completely ignored. Only an Admin can change roles.
    const assignedRole = 'Student';

    // Enforce institutional domain restriction on backend for local registration
    if (!isDomainAllowed(email)) {
      return res.status(403).json({
        success: false,
        message: 'Registration restricted. Only authorized institutional email accounts are permitted.'
      });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await userModel.createUser({
      fullName,
      email,
      passwordHash,
      phone,
      role: assignedRole
    });

    const roll = rollNumber || `STU${Date.now().toString().slice(-6)}`;
    await userModel.createStudent({
      userId,
      rollNumber: roll,
      departmentId: Number(department) || null,
      semester: Number(semester) || 1,
      batchYear: new Date().getFullYear()
    });

    const token = signToken({
      user_id: userId,
      email,
      role: assignedRole,
      full_name: fullName
    });

    const fullProfile = await userModel.findFullProfileById(userId);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: fullProfile
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const fullProfile = await userModel.findFullProfileById(req.user.user_id);
    if (!fullProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: fullProfile
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    let avatarUrl;

    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    await userModel.updateProfile(req.user.user_id, {
      fullName,
      phone,
      avatarUrl
    });

    const updated = await userModel.findFullProfileById(req.user.user_id);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  googleLogin,
  googleOAuthCallback,
  loginWithPassword,
  register,
  getCurrentUser,
  updateProfile,
  logout
};
