/**
 * API Routes Index
 */

const express = require("express");
const router = express.Router();

// Core routes
router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/vendors", require("./vendor.routes"));
router.use("/equipments", require("./equipment.routes"));
router.use("/bookings", require("./booking.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/payment-webhooks", require("./payment-webhook.routes"));
router.use("/wallet", require("./wallet.routes"));
router.use("/payouts", require("./payout.routes"));
router.use("/reports", require("./report.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/settings", require("./settings.routes"));
router.use("/support", require("./support.routes"));
router.use("/delivery", require("./delivery.routes"));
router.use("/disputes", require("./dispute.routes"));
router.use("/reviews", require("./review.routes"));
router.use("/commissions", require("./commission.routes"));

module.exports = router;
