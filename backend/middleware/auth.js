import jwt from "jsonwebtoken";
import User from "../models/User.js";

// This middleware function protects routes
export const protect = async (req, res, next) => {
  let token; // Check if the request has an authorization header and if it starts with "Bearer"

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Get the token from the header (it's in the format "Bearer TOKEN")
      token = req.headers.authorization.split(" ")[1]; // 2. Verify the token using your secret key

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // 3. Find the user associated with the token and attach them to the request // We select("-password") to prevent sending the password back

      req.user = await User.findById(decoded.user.id).select("-password"); // 4. Continue to the next middleware or the route handler

      next();
    } catch (error) {
      // If verification fails, send a 401 Unauthorized response
      console.error(error);
      res.status(401).json({ msg: "Not authorized, token failed" });
    }
  } // If no token is provided in the header, send a 401 Unauthorized response

  if (!token) {
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};
