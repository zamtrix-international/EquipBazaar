const crypto = require("crypto");

function makeIdempotencyKey(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

module.exports = { makeIdempotencyKey };