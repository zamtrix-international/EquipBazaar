const express = require("express");
const router = express.Router();

// Public routes
router.use("/auth", require("./auth.routes"));
router.use("/webhook", require("./paymentWebhook.routes"));

// User management
router.use("/users", require("./user.routes"));
router.use("/vendors", require("./vendor.routes"));

// Marketplace
router.use("/equipments", require("./equipment.routes"));
router.use("/bookings", require("./booking.routes"));
router.use("/payments", require("./payment.routes"));

// Commission & business logic
router.use("/commission", require("./commission.routes"));
router.use("/delivery", require("./delivery.routes"));
router.use("/dispute", require("./dispute.routes"));
router.use("/review", require("./review.routes"));

// Vendor finance
router.use("/wallet", require("./wallet.routes"));
router.use("/payouts", require("./payout.routes"));

// Support & reports
router.use("/support", require("./support.routes"));
router.use("/reports", require("./report.routes"));

// Admin
router.use("/settings", require("./settings.routes"));
router.use("/admin", require("./admin.routes"));

module.exports = router;