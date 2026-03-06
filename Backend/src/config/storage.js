const path = require("path");
const fs = require("fs");

function ensureLocalUploadDir() {
  const dir = process.env.LOCAL_UPLOAD_DIR || "uploads";
  const abs = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true });
  return abs;
}

module.exports = { ensureLocalUploadDir };