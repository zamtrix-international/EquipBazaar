/**
 * Equipment Controller
 * Handles equipment management and operations
 */

const asyncHandler = require('../utils/asyncHandler');
const equipmentService = require('../services/equipment.service');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Get all public equipment
 */
const getAllEquipment = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, city } = req.query;

  const result = await equipmentService.getAllEquipment({
    page: Number(page),
    limit: Number(limit),
    type,
    city,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Equipment list retrieved'));
});

/**
 * Create equipment
 */
const createEquipment = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.createEquipment(req.user.id, req.body);

  res
    .status(201)
    .json(new ApiResponse(201, equipment, 'Equipment created'));
});

/**
 * Get equipment
 */
const getEquipment = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.getEquipmentById(req.params.equipmentId);

  res
    .status(200)
    .json(new ApiResponse(200, equipment, 'Equipment retrieved'));
});

/**
 * Get vendor equipment
 */
const getVendorEquipment = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await equipmentService.getVendorEquipment(
    req.user.id,
    Number(page),
    Number(limit)
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Vendor equipment retrieved'));
});

/**
 * Update equipment
 */
const updateEquipment = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.updateEquipment(
    req.params.equipmentId,
    req.body
  );

  res
    .status(200)
    .json(new ApiResponse(200, equipment, 'Equipment updated'));
});

/**
 * Add equipment image
 */
const addEquipmentImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'No file uploaded'));
  }

  const image = await equipmentService.addEquipmentImage(req.params.equipmentId, {
    imageUrl: req.file.path,
  });

  res
    .status(201)
    .json(new ApiResponse(201, image, 'Equipment image added'));
});

module.exports = {
  getAllEquipment,
  createEquipment,
  getEquipment,
  getVendorEquipment,
  updateEquipment,
  addEquipmentImage,
};