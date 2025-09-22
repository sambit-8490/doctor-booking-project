import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/auth.js";
import { protect } from "../middleware/auth.js"; // You'll need to create this file

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// New protected route for getting user data
router.get("/me", protect, getMe);

export default router;