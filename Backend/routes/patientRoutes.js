// routes/patientRoutes.js

import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import uploadPDF from "../middleware/uploadMiddleware.js";
import { downloadConditionPDF, getMyrecord } from "../controllers/patient.js";
// import { uploadPatientPDF } from "../../../../controllers/patientController.js"
import {
  createPatient,
  updatePatient,
  deletePatient,
  getMyPatients, // Doctor-specific patients
  uploadPatientPDF,
} from "../controllers/patient.js";

const router = express.Router();

// ==========================
// Multer setup for PDF uploads
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/patientPDFs"); // Folder to store PDFs
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.params.id}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};

const upload = multer({ storage, fileFilter });

// ==========================
// Routes
// ==========================

// GET all patients (Admin only)
router.get("/", protect, async (req, res) => {
  try {
    const patients = await User.find({ userType: "patient" }).select(
      "-password"
    );
    res.json(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET patients of the logged-in doctor
router.get("/my-patients", protect, getMyPatients);
router.get("/my-record", protect, getMyrecord);

// POST create a new patient
router.post("/", protect, createPatient);

// PUT update a patient
router.put("/:id", protect, updatePatient);

// DELETE remove a patient
router.delete("/:id", protect, deletePatient);

// POST upload a PDF for a patient's condition
// The field name in form-data: "conditionPDF"
router.post("/upload/:id", uploadPDF.single("file"), uploadPatientPDF);
// Download PDF route
router.get("/download-condition/:id", downloadConditionPDF);

export default router;
