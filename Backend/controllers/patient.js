// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import Appointment from "../models/Appointment.js";
// import multer from "multer";
// import path from "path";

// // ==========================
// // GET ALL PATIENTS
// // ==========================
// export const getPatients = async (req, res) => {
//   try {
//     if (req.user.userType !== "doctor" && req.user.userType !== "admin") {
//       return res.status(403).json({ success: false, msg: "Access denied." });
//     }

//     const patients = await User.find({ userType: "patient" }).select("-password");
//     res.status(200).json(patients);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, msg: "Server Error" });
//   }
// };

// // ==========================
// // CREATE NEW PATIENT
// // ==========================
// export const createPatient = async (req, res) => {
//   // ADDED: Destructure the 'username' field from the request body
//   const { fullName, email, phoneNumber, username, password, userType } = req.body;

//   try {
//     // 1. Check if user already exists by email
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, msg: "User with this email already exists." });
//     }

//     // ADDED: Check if username already exists to prevent duplicates
//     if (username) {
//         const existingUsername = await User.findOne({ username });
//         if (existingUsername) {
//             return res.status(400).json({ success: false, msg: "This username is already taken." });
//         }
//     }

//     // 2. Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // 3. Create new patient instance
//     const newPatient = new User({
//       fullName,
//       email,
//       phoneNumber,
//       username, // ADDED: Pass the username to the new User object
//       password: hashedPassword,
//       userType: userType || "patient",
//     });

//     // 4. Save the patient
//     await newPatient.save();

//     // 5. Respond with success
//     res.status(201).json({ success: true, msg: "Patient added successfully!", patient: newPatient });
//   } catch (err) {
//     console.error("Error during patient creation:", err.message);
//     res.status(500).json({ success: false, msg: "Server Error" });
//   }
// };

// // ==========================
// // UPDATE PATIENT
// // ==========================
// export const updatePatient = async (req, res) => {
//   const { id } = req.params;
//   // ADDED: Destructure the 'username' field for updates
//   const { fullName, email, phoneNumber, username, userType } = req.body;

//   try {
//     // ADDED: Check for duplicate username during an update
//     if (username) {
//         const existingUsername = await User.findOne({ username, _id: { $ne: id } });
//         if (existingUsername) {
//             return res.status(400).json({ success: false, msg: "This username is already taken." });
//         }
//     }

//     const updatedPatient = await User.findByIdAndUpdate(
//       id,
//       // ADDED: Include the username field in the update
//       { fullName, email, phoneNumber, username, userType },
//       { new: true }
//     ).select("-password");

//     if (!updatedPatient) {
//       return res.status(404).json({ success: false, msg: "Patient not found." });
//     }

//     res.status(200).json({ success: true, msg: "Patient updated successfully!", patient: updatedPatient });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, msg: "Server Error" });
//   }
// };

// // ==========================
// // DELETE PATIENT
// // ==========================
// export const deletePatient = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedPatient = await User.findByIdAndDelete(id);

//     if (!deletedPatient) {
//       return res.status(404).json({ success: false, msg: "Patient not found." });
//     }

//     res.status(200).json({ success: true, msg: "Patient deleted successfully!" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, msg: "Server Error" });
//   }
// };

// // ==========================
// // GET MY PATIENTS (For doctor)
// // ==========================
// export const getMyPatients = async (req, res) => {
//   try {
//     if (req.user.userType !== "doctor") {
//       return res.status(403).json({ success: false, msg: "Access denied." });
//     }

//     // Find all appointments for this doctor
//     const appointments = await Appointment.find({ doctor: req.user._id }).populate("patient", "-password");

//     // Extract unique patients
//     const patients = appointments
//       .map(appt => appt.patient)
//       .filter((p, index, self) => p && index === self.findIndex(t => t._id.toString() === p._id.toString()));

//     res.status(200).json({ success: true, patients });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, msg: "Server Error" });
//   }
// };

// // ==========================
// // UPLOAD PATIENT CONDITION PDF
// // ==========================
// export const uploadPatientConditionPDF = async (req, res) => {
//   try {
//     const patientId = req.params.id;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ success: false, msg: "No file uploaded." });
//     }

//     // Update the patient's document with the PDF filename
//     const patient = await User.findByIdAndUpdate(
//       patientId,
//       { conditionPDF: file.filename },
//       { new: true }
//     ).select("-password");

//     if (!patient) {
//       return res.status(404).json({ success: false, msg: "Patient not found." });
//     }

//     res.status(200).json({
//       success: true,
//       msg: "PDF uploaded successfully!",
//       patient,
//     });
//   } catch (err) {
//     console.error("Error uploading PDF:", err);
//     res.status(500).json({ success: false, msg: "Server Error" });
//   }
// };

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Appointment from "../models/Appointment.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// ==========================
// MULTER SETUP FOR PDF UPLOAD
// ==========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/patientPDFs";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  },
});

export const uploadPDF = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

// ==========================
// GET ALL PATIENTS
// ==========================
export const getPatients = async (req, res) => {
  try {
    if (!["doctor", "admin"].includes(req.user.userType)) {
      return res.status(403).json({ success: false, msg: "Access denied." });
    }
    const patients = await User.find({ userType: "patient" }).select(
      "-password"
    );
    res.status(200).json({ success: true, patients });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// ==========================
// CREATE PATIENT
// ==========================
export const createPatient = async (req, res) => {
  const { fullName, email, phoneNumber, username, password, userType } =
    req.body;
  try {
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, msg: "Email already exists." });
    }
    if (username && (await User.findOne({ username }))) {
      return res
        .status(400)
        .json({ success: false, msg: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10)
    );

    const newPatient = new User({
      fullName,
      email,
      phoneNumber,
      username,
      password: hashedPassword,
      userType: userType || "patient",
    });

    await newPatient.save();
    res.status(201).json({
      success: true,
      msg: "Patient added successfully!",
      patient: newPatient,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// ==========================
// UPDATE PATIENT
// ==========================
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phoneNumber, username, userType } = req.body;

  try {
    if (username && (await User.findOne({ username, _id: { $ne: id } }))) {
      return res
        .status(400)
        .json({ success: false, msg: "Username already taken." });
    }

    const updatedPatient = await User.findByIdAndUpdate(
      id,
      { fullName, email, phoneNumber, username, userType },
      { new: true }
    ).select("-password");

    if (!updatedPatient)
      return res
        .status(404)
        .json({ success: false, msg: "Patient not found." });

    res.status(200).json({
      success: true,
      msg: "Patient updated successfully!",
      patient: updatedPatient,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// ==========================
// DELETE PATIENT
// ==========================
export const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPatient = await User.findByIdAndDelete(id);
    if (!deletedPatient)
      return res
        .status(404)
        .json({ success: false, msg: "Patient not found." });
    res
      .status(200)
      .json({ success: true, msg: "Patient deleted successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// ==========================
// GET MY PATIENTS (DOCTOR)
// ==========================
export const getMyPatients = async (req, res) => {
  try {
    const { userType, _id } = req.user;

    if (!(userType !== "doctor" || userType !== "patient")) {
      return res.status(403).json({ success: false, msg: "Access denied." });
    }

    const appointments = await Appointment.find({
      doctor: _id,
    }).populate(["patient", "doctor"]);

    console.log(appointments);

    const patients = appointments
      .map((a) => a.patient)
      .filter(
        (p, i, self) =>
          p &&
          i === self.findIndex((t) => t._id.toString() === p._id.toString())
      );

    res.status(200).json({ success: true, patients });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const getMyrecord = async (req, res) => {
  try {
    const { userType, _id } = req.user;

    if (!(userType !== "doctor" || userType !== "patient")) {
      return res.status(403).json({ success: false, msg: "Access denied." });
    }

    const appointments = await Appointment.find({
      patient: _id,
    }).populate(["patient", "doctor"]);

    console.log(appointments);

    const patients = appointments
      .map((a) => a.patient)
      .filter(
        (p, i, self) =>
          p &&
          i === self.findIndex((t) => t._id.toString() === p._id.toString())
      );

    res.status(200).json({ success: true, patients });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// ==========================
// UPLOAD PATIENT CONDITION PDF
// ==========================
export const uploadPatientPDF = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No PDF uploaded." });
    }

    // Example: save filename to DB
    const filename = req.file.filename;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    user.conditionPDF = filename;
    await user.save().catch((error) => {
      res.status(500).json({
        success: true,
        msg: "file cant save",
        file: filename,
      });
    });

    res.status(200).json({
      success: true,
      msg: "PDF uploaded successfully",
      file: filename,
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

//download pdf

export const downloadConditionPDF = async (req, res) => {
  const { id } = req.params;
  // adjust path if needed

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ message: "File not found." });
  }
  const filename = user.conditionPDF;
  const filePath = path.join("uploads/patientPDFs", filename);
  // Check if file exists

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error downloading file." });
      }
    });
  } else {
    res.status(404).json({ message: "File not found." });
  }
};
