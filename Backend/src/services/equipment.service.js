/**
 * Equipment Service
 * Handles equipment management, availability, and images
 */

const Equipment = require('../models/Equipment');
const EquipmentImage = require('../models/EquipmentImage');
const EquipmentAvailability = require('../models/EquipmentAvailability');
const VendorProfile = require('../models/VendorProfile');
const { ApiError } = require('../utils/apiError');

/**
 * Resolve vendor profile id from logged-in user id
 */
const resolveVendorProfileId = async (userId) => {
  const vendorProfile = await VendorProfile.findOne({
    where: { userId },
  });

  if (!vendorProfile) {
    throw new ApiError(404, 'Vendor profile not found');
  }

  return vendorProfile.id;
};

/**
 * Normalize equipment payload
 */
const normalizeEquipmentData = (equipmentData = {}) => {
  const normalizedType =
    equipmentData.type ||
    equipmentData.category ||
    null;

  const normalizedTitle =
    equipmentData.title ||
    equipmentData.name ||
    null;

  const normalizedHourlyRate =
    equipmentData.hourlyRate ??
    equipmentData.dailyRate ??
    null;

  return {
    // Core fields
    type: normalizedType,
    title: normalizedTitle,
    hourlyRate: normalizedHourlyRate,

    // Extra fields
    name: equipmentData.name || normalizedTitle,
    description: equipmentData.description || null,
    category: equipmentData.category || normalizedType,
    dailyRate: equipmentData.dailyRate ?? null,

    capacityLabel: equipmentData.capacityLabel || null,
    kmRate: equipmentData.kmRate ?? null,
    minimumHours: equipmentData.minimumHours ?? 1,
    locationText: equipmentData.locationText || null,
    city: equipmentData.city || 'Meerut',

    isActive:
      typeof equipmentData.isActive === 'boolean'
        ? equipmentData.isActive
        : true,
  };
};

/**
 * Get all public equipment
 * NOTE:
 * - public/customer listing ke liye
 * - फिलहाल isApproved filter intentionally removed so testing/frontend easy rahe
 * - sirf active equipment dikhaya jayega
 */
const getAllEquipment = async ({ page = 1, limit = 10, type, city }) => {
  const offset = (page - 1) * limit;

  const where = {
    isActive: true,
  };

  if (type) {
    where.type = type;
  }

  if (city) {
    where.city = city;
  }

  return await Equipment.findAndCountAll({
    where,
    include: [
      { model: EquipmentImage, as: 'images' },
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Create equipment
 */
const createEquipment = async (userId, equipmentData) => {
  const vendorId = await resolveVendorProfileId(userId);
  const normalizedData = normalizeEquipmentData(equipmentData);

  return await Equipment.create({
    vendorId,
    ...normalizedData,
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
    throw new ApiError(404, 'Equipment not found');
  }

  return equipment;
};

/**
 * Get vendor equipment
 */
const getVendorEquipment = async (userId, page = 1, limit = 10) => {
  const vendorId = await resolveVendorProfileId(userId);
  const offset = (page - 1) * limit;

  return await Equipment.findAndCountAll({
    where: { vendorId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Update equipment
 */
const updateEquipment = async (equipmentId, updateData) => {
  const equipment = await getEquipmentById(equipmentId);
  const normalizedData = normalizeEquipmentData({
    ...equipment.toJSON(),
    ...updateData,
  });

  await equipment.update(normalizedData);
  return equipment;
};

/**
 * Add equipment image
 */
const addEquipmentImage = async (equipmentId, imageData) => {
  await getEquipmentById(equipmentId);

  return await EquipmentImage.create({
    equipmentId,
    ...imageData,
  });
};

/**
 * Set equipment availability
 */
const setEquipmentAvailability = async (equipmentId, availabilityData) => {
  await getEquipmentById(equipmentId);

  return await EquipmentAvailability.create({
    equipmentId,
    ...availabilityData,
  });
};

module.exports = {
  getAllEquipment,
  createEquipment,
  getEquipmentById,
  getVendorEquipment,
  updateEquipment,
  addEquipmentImage,
  setEquipmentAvailability,
};