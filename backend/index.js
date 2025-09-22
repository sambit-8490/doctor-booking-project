// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import sendEmail from "./Services/emailService.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/appointments", appointmentRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const startServer = async (port = 5000) => {
  await connectDB();
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      startServer(3000);
    } else {
      console.error(err);
    }
  });
};

startServer();
