const crypto = require("crypto");

function makeIdempotencyKey(input) {
  const value =
    typeof input === "object"
      ? JSON.stringify(input)
      : String(input);

  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

module.exports = { makeIdempotencyKey };