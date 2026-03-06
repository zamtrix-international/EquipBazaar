/**
 * Audit Service (Optional)
 * Direct audit operations beyond middleware
 */

const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Create audit log entry
 */
const createAuditLog = async (auditData) => {
  try {
    return await AuditLog.create(auditData);
  } catch (error) {
    logger.error('Error creating audit log:', error);
  }
};

/**
 * Get entity audit history
 */
const getEntityHistory = async (entityType, entityId) => {
  return await AuditLog.findAll({
    where: { entityType, entityId },
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get user audit history
 */
const getUserAuditHistory = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await AuditLog.findAndCountAll({
    where: { userId },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });
};

module.exports = {
  createAuditLog,
  getEntityHistory,
  getUserAuditHistory,
};
