// routes/reportsRoutes.js

import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// @route   GET /api/reports/user-summary
// @desc    Get a summary of users by type (patient, doctor, admin)
// @access  Private (Admin only)
router.get("/user-summary", protect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const patients = await User.countDocuments({ userType: "patient" });
    const doctors = await User.countDocuments({ userType: "doctor" });
    const admins = await User.countDocuments({ userType: "admin" });

    res.json({ totalUsers, patients, doctors, admins });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET /api/reports/all-users
// @desc    Get a detailed list of all users
// @access  Private (Admin only)
router.get("/all-users", protect, async (req, res) => {
  try {
    const allUsers = await User.find().select("-password");
    res.json(allUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET /api/reports/all-users/:id
// @desc    Get a specific user by ID (for QR code scanning)
// @access  Private
router.get("/all-users/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    // Check if it's a valid ObjectId format
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET /api/reports/demographics
// @desc    Get patient demographics (e.g., gender, age distribution)
// @access  Private (Admin only)
router.get("/demographics", protect, async (req, res) => {
  try {
    const demographics = await User.aggregate([
      {
        $match: { userType: "patient" } // Only include patients
      },
      {
        $group: {
          _id: "$gender", // Group by gender
          count: { $sum: 1 } // Count each gender
        }
      }
    ]);

    res.json(demographics);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

export default router;