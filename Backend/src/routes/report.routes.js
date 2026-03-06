/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Generate booking report
router.get('/booking', auth, rbac(['VENDOR']), reportController.generateBookingReport);

// Export report
router.post('/export', auth, rbac(['VENDOR']), reportController.exportReport);

// Get export status
router.get('/export/:exportId', auth, rbac(['VENDOR']), reportController.getExportStatus);

// Get vendor reports
router.get('/', auth, rbac(['VENDOR']), reportController.getVendorReports);

module.exports = router;
