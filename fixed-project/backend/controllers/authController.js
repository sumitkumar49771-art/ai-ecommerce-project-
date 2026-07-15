const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// A real-looking address: something@something.tld — rejects junk like "asdf" or "a@a"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
// At least 8 chars, one uppercase letter, one lowercase letter, and one digit
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// @route  POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Please enter your name" });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (!password || !STRONG_PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/auth/profile
exports.getProfile = async (req, res) => {
  res.json(req.user);
};

// @route  GET /api/auth/users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/auth/addresses
exports.getAddresses = async (req, res) => {
  res.json(req.user.addresses || []);
};

// @route  POST /api/auth/addresses
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { label, fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({ message: "All address fields are required" });
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number (digits only)" });
    }

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    user.addresses.push({
      label: label || "Home",
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/auth/addresses/:addressId
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/auth/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/wishlist/:productId (toggle add/remove)
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.params;
    const exists = user.wishlist.some((id) => id.toString() === productId);

    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ wishlist: user.wishlist, added: !exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/forgot-password
// Always responds with the same generic message whether or not the email
// exists — this stops someone from using this endpoint to check which
// emails are registered ShopAI accounts.
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const genericMsg = { message: "If an account with that email exists, a reset link has been sent." };

    if (!user) return res.json(genericMsg);

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://127.0.0.1:5501/frontend"}/reset-password.html?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your ShopAI password",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    res.json(genericMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    if (!req.body.password || !STRONG_PASSWORD_REGEX.test(req.body.password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number",
      });
    }
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
    }

    user.password = req.body.password; // pre-save hook hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // log them straight in after reset
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
