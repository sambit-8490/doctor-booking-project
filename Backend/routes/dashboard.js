// routes/dashboard.js
import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js"; // Optional: Protect this route

const router = express.Router();

router.get("/stats", protect, getDashboardStats);

export default router;