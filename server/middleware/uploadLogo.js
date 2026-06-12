const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/logos");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".png", ".jpg", ".jpeg"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG JPG JPEG allowed"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});