const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { ApiError } = require("../utils/apiError");
const { ROLES } = require("../constants/roles");
const { sequelize } = require("../config/db");
const { User, VendorProfile, VendorWallet } = require("../models");

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

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

  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingPhone = await User.findOne({ where: { phone } });
  if (existingPhone) throw new ApiError(409, "Phone already registered");

  if (email) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const safeRole = role === ROLES.VENDOR ? ROLES.VENDOR : ROLES.CUSTOMER;

  return await sequelize.transaction(async (t) => {

    const user = await User.create(
      {
        name,
        phone,
        email: email || null,
        passwordHash,
        role: safeRole,
        status: "ACTIVE",
      },
      { transaction: t }
    );

    if (safeRole === ROLES.VENDOR) {

      const businessName = payload.businessName || `${name}'s Equipment`;
      const ownerName = payload.ownerName || name;
      const city = payload.city || "Meerut";
      const address = payload.address || null;

      const vendorProfile = await VendorProfile.create(
        {
          userId: user.id,
          businessName,
          ownerName,
          city,
          address,
          isApproved: false,
          approvedAt: null,
        },
        { transaction: t }
      );

      await VendorWallet.create(
        {
          vendorId: vendorProfile.id,
          availableBalance: 0,
          pendingBalance: 0,
          lifetimeEarnings: 0,
        },
        { transaction: t }
      );
    }

    const token = signToken(user);
    return { user: sanitizeUser(user), token };

  });
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