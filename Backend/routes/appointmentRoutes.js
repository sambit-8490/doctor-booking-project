// // src/routes/appointmentRoutes.js

// import express from "express";
// import { protect } from "../middleware/auth.js";
// import User from "../models/User.js";
// import Appointment from "../models/Appointment.js";
// import sendEmail from "../Services/emailService.js";

// const router = express.Router();

// /**
//  * @route   GET /api/appointments/doctors
//  * @desc    Get all users with the 'doctor' userType for appointment booking
//  * @access  Private
//  */
// router.get("/doctors", protect, async (req, res) => {
//   try {
//     const doctors = await User.find({ userType: "doctor" }).select("-password");
//     res.json(doctors);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

// /**
//  * @route   GET /api/appointments/recent
//  * @desc    Get recent appointments for admin dashboard (last 10 appointments)
//  * @access  Private (Admin only)
//  */
// router.get("/recent", protect, async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user.userType !== "admin") {
//       return res.status(403).json({ msg: "Access denied. Admin only." });
//     }

//     const recentAppointments = await Appointment.find()
//       .populate("patient", "fullName email")
//       .populate("doctor", "fullName specialty department")
//       .sort({ createdAt: -1 }) // Sort by creation date, most recent first
//       .limit(10); // Limit to 10 most recent appointments

//     // Format the appointments data for the frontend
//     const formattedAppointments = recentAppointments.map((appointment) => {
//       const appointmentDate = new Date(appointment.date);

//       return {
//         id: appointment._id,
//         date: appointmentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
//         time: appointmentDate.toTimeString().split(" ")[0], // Format as HH:MM:SS
//         patientName: appointment.patient?.fullName || "Unknown Patient",
//         patientId: appointment.patient?._id || "N/A",
//         doctorName: appointment.doctor?.fullName || "Unknown Doctor",
//         doctorSpecialty: appointment.doctor?.specialty || "General",
//         department: appointment.doctor?.department || "General",
//         status: appointment.status,
//         createdAt: appointment.createdAt,
//       };
//     });

//     res.json({
//       success: true,
//       appointments: formattedAppointments,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       success: false,
//       msg: "Server Error",
//     });
//   }
// });

// /**
//  * @route   POST /api/appointments
//  * @desc    Create a new appointment
//  * @access  Private (Patient can create an appointment)
//  */
// router.post("/", protect, async (req, res) => {
//   try {
//     const { doctorId, appointmentDate } = req.body;
//     const patientId = req.user.id;

//     const doctor = await User.findById(doctorId);
//     const patient = await User.findById(patientId);

//     if (!doctor || !patient) {
//       return res.status(404).json({ msg: "Doctor or patient not found" });
//     }

//     const newAppointment = new Appointment({
//       patient: patientId,
//       doctor: doctorId,
//       date: new Date(appointmentDate),
//     });

//     await newAppointment.save();
//     res.status(201).json({
//       msg: "Appointment booked successfully!",
//       appointment: newAppointment,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

// /**
//  * @route   GET /api/appointments/my-appointments
//  * @desc    Get all upcoming appointments for the logged-in patient
//  * @access  Private (Patient)
//  */
// router.get("/my-appointments", protect, async (req, res) => {
//   try {
//     const patientId = req.user.id;
//     const upcomingAppointments = await Appointment.find({
//       patient: patientId,
//       date: { $gte: new Date() }, // Filter for appointments in the future
//     })
//       .populate("doctor", "fullName") // This fetches the doctor's name
//       .sort({ date: 1 }); // Sort by date ascending

//     res.json(upcomingAppointments);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

// /**
//  * @route   GET /api/appointments/my-appointments-all
//  * @desc    Get all appointments (past and upcoming) for the logged-in patient
//  * @access  Private (Patient)
//  */
// router.get("/my-appointments-all", protect, async (req, res) => {
//   try {
//     const patientId = req.user.id;
//     const allAppointments = await Appointment.find({
//       patient: patientId,
//     })
//       .populate("doctor", "fullName")
//       .sort({ date: -1 }); // Sort by date descending (most recent first)

//     res.json(allAppointments);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

// /**
//  * @route   GET /api/appointments
//  * @desc    Get all appointments (for admin)
//  * @access  Private (Admin only)
//  */
// router.get("/", protect, async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user.userType !== "admin") {
//       return res.status(403).json({ msg: "Access denied. Admin only." });
//     }

//     const { status, page = 1, limit = 20 } = req.query;
//     const query = status ? { status } : {};

//     const appointments = await Appointment.find(query)
//       .populate("patient", "fullName email")
//       .populate("doctor", "fullName specialty department")
//       .sort({ date: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Appointment.countDocuments(query);

//     res.json({
//       success: true,
//       appointments,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       success: false,
//       msg: "Server Error",
//     });
//   }
// });

// /**
//  * @route   PUT /api/appointments/:id/status
//  * @desc    Update appointment status
//  * @access  Private (Admin or Doctor)
//  */
// router.put("/:id/status", protect, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const appointmentId = req.params.id;

//     //Check if user is admin or doctor
//     if (req.user.userType !== "admin" && req.user.userType !== "doctor") {
//       return res.status(403).json({ msg: "Access denied." });
//     }

//     // Validate status
//     const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ msg: "Invalid status value" });
//     }

//     const appointment = await Appointment.findById(appointmentId)
//       .populate("patient", "fullName email")
//       .populate("doctor", "fullName");

//     if (!appointment) {
//       return res.status(404).json({ msg: "Appointment not found" });
//     }

//     //If user is a doctor, they can only update their own appointments
//     if (
//       req.user.userType === "doctor" &&
//       appointment.doctor._id.toString() !== req.user.id
//     ) {
//       return res
//         .status(403)
//         .json({ msg: "You can only update your own appointments" });
//     }

//     appointment.status = status;
//     await appointment.save();

//     // Send email notification to patient
//     if (appointment.patient?.email) {
//       const subject = `Appointment Status Update`;
//       const message = `Hello ${appointment.patient.fullName},\n\nYour appointment with Dr. ${appointment.doctor.fullName} is now *${status.toUpperCase()}*.\n\nThank you,\nHospital Team`;
//       await sendEmail(appointment.patient.email, subject, message);
//     }

//     res.json({
//       success: true,
//       msg: "Appointment status updated successfully",
//       appointment,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       success: false,
//       msg: "Server Error",
//       error: error.message,
//     });
//   }
// });

// export default router;
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getDoctors,
  bookAppointment,
  getMyAppointments,
  getMyAppointmentsAll,
  getRecentAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  // Add this controller for doctor-specific appointments
  getDoctorAppointments,
} from "../controllers/appointmentController.js";

const router = express.Router();

// Patient routes
router.get("/doctors", protect, getDoctors);
router.post("/", protect, bookAppointment);
router.get("/my-appointments", protect, getMyAppointments);
router.get("/my-appointments-all", protect, getMyAppointmentsAll);

// Doctor route (new)
router.get("/doctor/appointments", protect, getDoctorAppointments);

// Admin routes
router.get("/recent", protect, getRecentAppointments);
router.get("/", protect, getAllAppointments);
router.put("/:id/status", protect, updateAppointmentStatus);

export default router;
