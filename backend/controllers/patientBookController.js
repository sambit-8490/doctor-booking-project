// src/controllers/patientAppointmentController.js

import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import sendEmail from "../Services/emailService.js";

/**
 * Get all doctors for appointment booking
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

    // ✅ Send email to patient confirming the booking
    if (patient.email) {
      const subject = "Appointment Booked Successfully ✅";
      const message = `Hello ${patient.fullName},

Your appointment with Dr. ${doctor.fullName} is successfully booked.

📅 Date: ${new Date(appointmentDate).toDateString()}
⏰ Time: ${new Date(appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}

Thank you,
My Hospital`;

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
 * Get all upcoming appointments for logged-in patient
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
 * Get all appointments (past & upcoming) for logged-in patient
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
