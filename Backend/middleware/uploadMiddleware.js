import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/patientPDFs"); // upload folder
  },
  filename: function (req, file, cb) {
    const userId = req.params.id; // user ID from route
    const timestamp = Date.now(); // current timestamp
    const ext = path.extname(file.originalname); // preserve extension
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_"); // sanitize spaces

    // Example: patient-<userId>-<timestamp>-<originalName>.pdf
    const uniqueName = `patient-${userId}-${timestamp}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter: only PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// Multer upload middleware
const uploadPDF = multer({
  storage: storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default uploadPDF;
