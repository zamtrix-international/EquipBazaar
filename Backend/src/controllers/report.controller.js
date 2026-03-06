/**
 * Report Controller
 * Handles report generation and export
 */

const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/report.service');
const apiResponse = require('../utils/apiResponse');

/**
 * Generate booking report
 */
const generateBookingReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateBookingReport(req.user.id, req.query);
  res.status(200).json(new apiResponse(200, report, 'Booking report generated'));
});

/**
 * Export report
 */
const exportReport = asyncHandler(async (req, res) => {
  const { reportType, format = 'CSV' } = req.body;

  const export_record = await reportService.exportReport(
    req.user.id,
    reportType,
    format
  );

  res.status(201).json(
    new apiResponse(201, export_record, 'Report export initiated')
  );
});

/**
 * Get export status
 */
const getExportStatus = asyncHandler(async (req, res) => {
  const export_record = await reportService.getExportStatus(req.params.exportId);
  res.status(200).json(new apiResponse(200, export_record, 'Export status retrieved'));
});

/**
 * Get vendor reports
 */
const getVendorReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const reports = await reportService.getVendorReports(req.user.id, page, limit);
  res.status(200).json(new apiResponse(200, reports, 'Vendor reports retrieved'));
});

module.exports = {
  generateBookingReport,
  exportReport,
  getExportStatus,
  getVendorReports,
};
