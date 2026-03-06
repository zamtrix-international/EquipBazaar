const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));

// Next modules will be mounted here later:
// router.use("/users", require("./user.routes"));
// router.use("/vendors", require("./vendor.routes"));
// router.use("/equipments", require("./equipment.routes"));
// router.use("/bookings", require("./booking.routes"));
// router.use("/payments", require("./payment.routes"));
// router.use("/wallet", require("./wallet.routes"));
// router.use("/payouts", require("./payout.routes"));
// router.use("/support", require("./support.routes"));
// router.use("/reports", require("./report.routes"));
// router.use("/settings", require("./settings.routes"));
// router.use("/admin", require("./admin.routes"));

module.exports = router;