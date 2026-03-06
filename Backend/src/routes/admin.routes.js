/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Get dashboard stats
router.get('/dashboard', auth, rbac(['ADMIN']), adminController.getDashboardStats);

// Get pending approvals
router.get('/approvals', auth, rbac(['ADMIN']), adminController.getPendingApprovals);

// Get system logs
router.get('/logs', auth, rbac(['ADMIN']), adminController.getSystemLogs);

module.exports = router;
