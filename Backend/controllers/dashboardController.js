// // controllers/dashboardController.js
// import User from "../models/User.js";

// export const getDashboardStats = async (req, res) => {
//   try {
//     // Count the total number of users with the userType 'patient'
//     const totalPatients = await User.countDocuments({ userType: 'patient' });
    
//     // Count the total number of users with the userType 'doctor'
//     const totalDoctors = await User.countDocuments({ userType: 'doctor' });
    
//     // Example: Count new registrations for the day
//     // This assumes your User model has a 'createdAt' timestamp
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set to the beginning of the day
//     const newRegistrations = await User.countDocuments({ createdAt: { $gte: today } });

//     // Send the stats back to the front end
//     res.json({
//       success: true,
//       stats: {
//         totalPatients,
//         totalDoctors,
//         newRegistrations,
//         // You would add other metrics here, like upcoming appointments from a separate model
//         upcomingAppointments: 25, // Placeholder
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, msg: "Server Error" });
//   }
// };







// controllers/dashboardController.js
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

export const getDashboardStats = async (req, res) => {
  try {
    // --- User stats ---
    const totalPatients = await User.countDocuments({ userType: "patient" });
    const totalDoctors = await User.countDocuments({ userType: "doctor" });

    // Count new registrations today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const newRegistrations = await User.countDocuments({
      createdAt: { $gte: today },
    });

    // --- Appointment stats ---
    const now = new Date();

    const upcomingAppointments = await Appointment.countDocuments({
      date: { $gte: now },
      status: { $in: ["pending", "confirmed"] },
    });

    const completedAppointments = await Appointment.countDocuments({
      status: "completed",
    });

    const cancelledAppointments = await Appointment.countDocuments({
      status: "cancelled",
    });

    // --- Send response ---
    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        newRegistrations,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server Error",
      error: err.message,
    });
  }
};
