const multer = require("multer");
const path = require("path");
const { ensureLocalUploadDir } = require("../config/storage");
const { safeFileName } = require("../utils/fileUpload");

const uploadDir = ensureLocalUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, safeFileName(file.originalname)),
});

function fileFilter(req, file, cb) {
  // allow images + pdf
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.mimetype)) return cb(new Error("Unsupported file type"), false);
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

module.exports = { upload };