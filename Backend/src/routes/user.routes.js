/**
 * User Routes
 */

const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

// Get user profile
router.get("/profile", auth, userController.getUserProfile);

// Update user profile
router.put("/profile", auth, userController.updateUserProfile);

// Get all users (admin only)
router.get("/", auth, rbac("ADMIN"), userController.getAllUsers);

module.exports = router;
