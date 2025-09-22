// src/controllers/appointmentController.js

import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import sendEmail from "../Services/emailService.js";

/**
 * Get all doctors for appointment booking (Patient)
 */
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ userType: "doctor" }).select("-password");
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

/**
 * Book a new appointment (Patient)
 */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate } = req.body;
    const patientId = req.user.id;

    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ msg: "Doctor or patient not found" });
    }

    const newAppointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date: new Date(appointmentDate),
    });

    await newAppointment.save();

    // Send email confirmation to patient
    if (patient.email) {
      const subject = "Appointment Booked Successfully ✅";
      const message = `Hello ${patient.fullName},

Your appointment with Dr. ${doctor.fullName} is successfully booked.

📅 Date: ${new Date(appointmentDate).toDateString()}
⏰ Time: ${new Date(appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}

Thank you,
Hospital Team`;

      await sendEmail(patient.email, subject, message);
    }

    res.status(201).json({
      msg: "Appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

/**
 * Get upcoming appointments for logged-in patient
 */
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const upcomingAppointments = await Appointment.find({
      patient: patientId,
      date: { $gte: new Date() },
    })
      .populate("doctor", "fullName")
      .sort({ date: 1 });

    res.json(upcomingAppointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

/**
 * Get all appointments (past + upcoming) for logged-in patient
 */
export const getMyAppointmentsAll = async (req, res) => {
  try {
    const patientId = req.user.id;
    const allAppointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "fullName")
      .sort({ date: -1 });

    res.json(allAppointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

/**
 * Get recent appointments (Admin)
 */
export const getRecentAppointments = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    const recentAppointments = await Appointment.find()
      .populate("patient", "fullName email")
      .populate("doctor", "fullName specialty department")
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedAppointments = recentAppointments.map((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return {
        id: appointment._id,
        date: appointmentDate.toISOString().split("T")[0],
        time: appointmentDate.toTimeString().split(" ")[0],
        patientName: appointment.patient?.fullName || "Unknown Patient",
        patientId: appointment.patient?._id || "N/A",
        doctorName: appointment.doctor?.fullName || "Unknown Doctor",
        doctorSpecialty: appointment.doctor?.specialty || "General",
        department: appointment.doctor?.department || "General",
        status: appointment.status,
        createdAt: appointment.createdAt,
      };
    });

    res.json({ success: true, appointments: formattedAppointments });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

/**
 * Get all appointments (Admin)
 */
export const getAllAppointments = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const appointments = await Appointment.find(query)
      .populate("patient", "fullName email")
      .populate("doctor", "fullName specialty department")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

/**
 * Update appointment status (Admin or Doctor)
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    if (req.user.userType !== "admin" && req.user.userType !== "doctor") {
      return res.status(403).json({ msg: "Access denied." });
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "fullName email")
      .populate("doctor", "fullName");

    if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

    if (req.user.userType === "doctor" && appointment.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only update your own appointments" });
    }

    appointment.status = status;
    await appointment.save();

    // Send email notification to patient
    if (appointment.patient?.email) {
      const subject = `Appointment Status Update`;
      const message = `Hello ${appointment.patient.fullName},\n\nYour appointment with Dr. ${appointment.doctor.fullName} is now *${status.toUpperCase()}*.\n\nThank you,\nHospital Team`;
      await sendEmail(appointment.patient.email, subject, message);
    }

    res.json({ success: true, msg: "Appointment status updated successfully", appointment });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error", error: err.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    if (req.user.userType !== "doctor") {
      return res.status(403).json({ msg: "Access denied. Doctors only." });
    }

    const doctorId = req.user.id;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "fullName email")
      .sort({ date: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};
