const express = require("express");
const router = express.Router();

const walletController = require("../controllers/wallet.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");

router.get(
  "/balance",
  auth,
  rbac("VENDOR"),
  walletController.getWalletBalance
);

router.get(
  "/ledger",
  auth,
  rbac("VENDOR"),
  walletController.getWalletLedger
);

module.exports = router;