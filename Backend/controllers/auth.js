import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ==========================
// REGISTER USER
// ==========================
export const registerUser = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    username,
    password,
    confirmPassword,
    userType,
  } = req.body;

  try {
    // 1. Check if all required fields are provided
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !username ||
      !password ||
      !confirmPassword ||
      !userType
    ) {
      return res
        .status(400)
        .json({ success: false, msg: "Please fill in all required fields." });
    }

    // 2. Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          msg: "User with this username or email already exists.",
        });
    }

    // 3. Check if passwords match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, msg: "Passwords do not match." });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create and save new user
    const user = new User({
      fullName,
      email,
      phoneNumber,
      username,
      password: hashedPassword,
      userType,
    });
    await user.save();

    // 6. Respond with registration success
    res.status(201).json({
      success: true,
      msg: "🎉 Registration successful! You can now log in.",
    });
  } catch (err) {
    console.error("ERROR DETAILS:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error. Please try again later." });
  }
};

// ==========================
// LOGIN USER
// ==========================
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Check if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Please enter both username and password.",
        });
    }

    // 2. Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid username or password." });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid username or password." });
    }

    // 4. Create JWT token
    const payload = { user: { id: user.id, userType: user.userType } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 5. Send login success response
    res.json({
      success: true,
      msg: `✅ Login successful! Welcome back, ${user.fullName}.`,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error("ERROR DETAILS:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error. Please try again later." });
  }
};

// ==========================
// GET LOGGED-IN USER INFO
// ==========================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};


