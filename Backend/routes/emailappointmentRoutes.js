const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// PUT /api/emailappointments/:id/status
router.put("/:id/status", appointmentController.updateStatus);

module.exports = router;
