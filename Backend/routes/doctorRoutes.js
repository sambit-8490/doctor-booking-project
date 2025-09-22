// routes/doctorRoutes.js

import express from "express";
import { protect } from "../middleware/auth.js";
import {
    getDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
} from "../controllers/doctors.js"; // Make sure the path is correct

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Get all users with the 'doctor' userType
 * @access  Private (Admin only)
 */
router.get("/", protect, getDoctors);

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor
 * @access  Private (Admin only)
 */
router.post("/", protect, createDoctor);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update a doctor by ID
 * @access  Private (Admin only)
 */
router.put("/:id", protect, updateDoctor);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete a doctor by ID
 * @access  Private (Admin only)
 */
router.delete("/:id", protect, deleteDoctor);
// router.get("/my-", protect, getMyPatients);
export default router;