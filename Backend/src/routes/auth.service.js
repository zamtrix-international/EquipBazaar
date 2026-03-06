const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { ApiError } = require("../utils/apiError");
const { makeIdempotencyKey } = require("../utils/idempotency");
const { ROLES } = require("../constants/roles");
const { User, VendorProfile, VendorWallet } = require("../models");

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

async function register(payload) {
  const { name, phone, email, password, role } = payload;

  const existingPhone = await User.findOne({ where: { phone } });
  if (existingPhone) throw new ApiError(409, "Phone already registered");

  if (email) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Restrict role assignment from public register:
  // Customer can register freely; Vendor also allowed (needs admin approval in vendor profile).
  // Admin should not be created from public register.
  const safeRole = role === ROLES.VENDOR ? ROLES.VENDOR : ROLES.CUSTOMER;

  const user = await User.create({
    name,
    phone,
    email: email || null,
    passwordHash,
    role: safeRole,
    status: "ACTIVE",
  });

  // If vendor registers: create VendorProfile placeholder + Wallet now
  if (safeRole === ROLES.VENDOR) {
    const businessName = payload.businessName || `${name}'s Equipment`;
    const ownerName = payload.ownerName || name;
    const city = payload.city || "Meerut";
    const address = payload.address || null;

    const vendorProfile = await VendorProfile.create({
      userId: user.id,
      businessName,
      ownerName,
      city,
      address,
      isApproved: false,
      approvedAt: null,
    });

    // wallet (ledger-based later)
    await VendorWallet.create({
      vendorId: vendorProfile.id,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
    });
  }

  const token = signToken(user);

  return { user: sanitizeUser(user), token };
}

async function login(payload) {
  const { phoneOrEmail, password } = payload;

  const user = await User.findOne({
    where: phoneOrEmail.includes("@")
      ? { email: phoneOrEmail }
      : { phone: phoneOrEmail },
  });

  if (!user) throw new ApiError(401, "Invalid credentials");

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "Account is blocked. Contact support.");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);

  return { user: sanitizeUser(user), token };
}

module.exports = { register, login };