/**
 * Equipment Service
 * Handles equipment management, availability, and images
 */

const Equipment = require('../models/Equipment');
const EquipmentImage = require('../models/EquipmentImage');
const EquipmentAvailability = require('../models/EquipmentAvailability');
const apiError = require('../utils/apiError');
const { Op } = require('sequelize');

/**
 * Create equipment
 */
const createEquipment = async (vendorId, equipmentData) => {
  return await Equipment.create({
    vendorId,
    ...equipmentData,
  });
};

/**
 * Get equipment by ID
 */
const getEquipmentById = async (equipmentId) => {
  const equipment = await Equipment.findByPk(equipmentId, {
    include: [
      { model: EquipmentImage, as: 'images' },
      { model: EquipmentAvailability, as: 'availability' },
    ],
  });
  if (!equipment) {
    throw new apiError(404, 'Equipment not found');
  }
  return equipment;
};

/**
 * Get vendor equipment
 */
const getVendorEquipment = async (vendorId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await Equipment.findAndCountAll({
    where: { vendorId },
    offset,
    limit,
  });
};

/**
 * Update equipment
 */
const updateEquipment = async (equipmentId, updateData) => {
  const equipment = await getEquipmentById(equipmentId);
  await equipment.update(updateData);
  return equipment;
};

/**
 * Add equipment image
 */
const addEquipmentImage = async (equipmentId, imageData) => {
  return await EquipmentImage.create({
    equipmentId,
    ...imageData,
  });
};

/**
 * Set equipment availability
 */
const setEquipmentAvailability = async (equipmentId, availabilityData) => {
  return await EquipmentAvailability.create({
    equipmentId,
    ...availabilityData,
  });
};

module.exports = {
  createEquipment,
  getEquipmentById,
  getVendorEquipment,
  updateEquipment,
  addEquipmentImage,
  setEquipmentAvailability,
};
