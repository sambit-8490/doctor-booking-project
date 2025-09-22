import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ==========================
// GET ALL DOCTORS
// ==========================
export const getDoctors = async (req, res) => {
    try {
        // Only allow admins to view the list of doctors
        if (req.user.userType !== "admin") {
            return res.status(403).json({ success: false, msg: "Access denied. Only admins can view doctors." });
        }

        const doctors = await User.find({ userType: "doctor" }).select("-password");
        res.status(200).json(doctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

// ==========================
// CREATE NEW DOCTOR
// ==========================
export const createDoctor = async (req, res) => {
    // Only allow admins to create new doctors
    if (req.user.userType !== "admin") {
        return res.status(403).json({ success: false, msg: "Access denied. Only admins can add doctors." });
    }
    
    // Destructure doctor-specific fields like 'specialty'
    const { fullName, email, phoneNumber, specialty, password, username } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, msg: "User with this email already exists." });
        }

        if (username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ success: false, msg: "This username is already taken." });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDoctor = new User({
            fullName,
            email,
            phoneNumber,
            username,
            specialty, // Add the specialty field
            password: hashedPassword,
            userType: "doctor", // Explicitly set userType to 'doctor'
        });

        await newDoctor.save();

        const doctorData = newDoctor.toObject();
        delete doctorData.password; // Remove password before sending the response

        res.status(201).json({ success: true, msg: "Doctor added successfully!", doctor: doctorData });
    } catch (err) {
        console.error("Error during doctor creation:", err.message);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

// ==========================
// UPDATE DOCTOR
// ==========================
export const updateDoctor = async (req, res) => {
    // Only allow admins to update doctors
    if (req.user.userType !== "admin") {
        return res.status(403).json({ success: false, msg: "Access denied. Only admins can update doctors." });
    }

    const { id } = req.params;
    const { fullName, email, phoneNumber, specialty, username } = req.body;

    try {
        if (username) {
            const existingUsername = await User.findOne({ username, _id: { $ne: id } });
            if (existingUsername) {
                return res.status(400).json({ success: false, msg: "This username is already taken." });
            }
        }
        
        const updatedDoctor = await User.findByIdAndUpdate(
            id,
            { fullName, email, phoneNumber, specialty, username },
            { new: true }
        ).select("-password");

        if (!updatedDoctor) {
            return res.status(404).json({ success: false, msg: "Doctor not found." });
        }

        res.status(200).json({ success: true, msg: "Doctor updated successfully!", doctor: updatedDoctor });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};

// ==========================
// DELETE DOCTOR
// ==========================
export const deleteDoctor = async (req, res) => {
    // Only allow admins to delete doctors
    if (req.user.userType !== "admin") {
        return res.status(403).json({ success: false, msg: "Access denied. Only admins can delete doctors." });
    }

    const { id } = req.params;

    try {
        const deletedDoctor = await User.findByIdAndDelete(id);

        if (!deletedDoctor) {
            return res.status(404).json({ success: false, msg: "Doctor not found." });
        }

        res.status(200).json({ success: true, msg: "Doctor deleted successfully!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};