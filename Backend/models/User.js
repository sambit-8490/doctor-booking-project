import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    userType: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient",
    },
    password: {
      type: String,
      required: true,
    },
    // You need to add this field here 👇
    specialty: {
      type: String,
      required: false, // Set to false to allow "N/A"
      trim: true,
    },
    conditionPDF: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
