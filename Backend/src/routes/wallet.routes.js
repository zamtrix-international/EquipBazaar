/**
 * Wallet Routes
 */

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Get wallet balance
router.get('/balance', auth, rbac(['VENDOR']), walletController.getWalletBalance);

// Get wallet ledger
router.get('/ledger', auth, rbac(['VENDOR']), walletController.getWalletLedger);

// Add funds to wallet
router.post('/add-funds', auth, rbac(['VENDOR']), walletController.addWalletFunds);

module.exports = router;
