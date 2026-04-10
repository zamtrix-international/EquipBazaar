/**
 * Image Utilities for handling fallback images and placeholders
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Fallback placeholder images as base64 or SVG data URIs
export const PLACEHOLDERS = {
  EQUIPMENT: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Crect x='180' y='90' width='240' height='160' rx='16' fill='%23d1d5db'/%3E%3Ccircle cx='255' cy='155' r='24' fill='%239ca3af'/%3E%3Cpath d='M200 230l60-50 45 35 45-55 50 70' fill='none' stroke='%236b7280' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='300' y='315' text-anchor='middle' font-family='Arial' font-size='28' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E",
  
  USER_AVATAR: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%239ca3af'/%3E%3Cellipse cx='100' cy='140' rx='50' ry='45' fill='%239ca3af'/%3E%3C/svg%3E",

  CATEGORY: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Crect x='100' y='75' width='200' height='150' rx='8' fill='%23d1d5db'/%3E%3Crect x='120' y='90' width='160' height='80' fill='%23e5e7eb'/%3E%3Ctext x='200' y='240' text-anchor='middle' font-family='Arial' font-size='24' fill='%236b7280'%3ECategory%3C/text%3E%3C/svg%3E",

  BANNER: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cdefs%3E%3ClinearGradient id='grad'%3E%3Cstop offset='0%25' style='stop-color:%233b82f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%231e40af;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='400' fill='url(%23grad)'/%3E%3Ctext x='600' y='170' text-anchor='middle' font-family='Arial' font-size='48' font-weight='bold' fill='white'%3EEquipment Marketplace%3C/text%3E%3Ctext x='600' y='250' text-anchor='middle' font-family='Arial' font-size='24' fill='white' opacity='0.8'%3ERent What You Need, When You Need It%3C/text%3E%3C/svg%3E",

  LOADING: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23e5e7eb' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%233b82f6' stroke-width='4' stroke-dasharray='62.8' stroke-dashoffset='31.4'/%3E%3C/svg%3E",
};

/**
 * Resolves image URL with proper handling of various formats
 * @param {string} imageUrl - The image URL from backend
 * @param {string} fallback - The fallback placeholder to use
 * @returns {string} - Valid image URL with proper base URL
 */
export const resolveImageUrl = (imageUrl, fallback = PLACEHOLDERS.EQUIPMENT) => {
  // Return placeholder if no image provided
  if (!imageUrl) {
    return fallback;
  }

  // Return as-is if it's already a full URL or data URI
  if (/^https?:\/\//i.test(imageUrl) || String(imageUrl).startsWith('data:')) {
    return imageUrl;
  }

  // Return placeholder if it's a Windows path
  const normalizedPath = String(imageUrl).replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(normalizedPath)) {
    return fallback;
  }

  // Prepend base URL for relative paths
  return normalizedPath.startsWith('/') 
    ? `${API_BASE_URL}${normalizedPath}` 
    : `${API_BASE_URL}/${normalizedPath}`;
};

/**
 * Get image from various possible booking/equipment object structures
 * @param {object} item - Equipment or booking object
 * @param {string} fallback - Fallback placeholder
 * @returns {string} - Resolved image URL
 */
export const getEquipmentImage = (item = {}, fallback = PLACEHOLDERS.EQUIPMENT) => {
  const imageUrl =
    item.image ||
    item.images?.[0]?.url ||
    item.images?.[0]?.imageUrl ||
    item.equipment?.images?.[0]?.url ||
    item.equipment?.images?.[0]?.imageUrl ||
    item.equipment?.image ||
    '';

  return resolveImageUrl(imageUrl, fallback);
};

/**
 * Get user avatar image
 * @param {object} user - User object
 * @param {string} fallback - Fallback placeholder
 * @returns {string} - Resolved avatar URL
 */
export const getUserAvatar = (user = {}, fallback = PLACEHOLDERS.USER_AVATAR) => {
  const imageUrl = user.avatar || user.profilePicture || user.image || '';
  return resolveImageUrl(imageUrl, fallback);
};

/**
 * Cache equipment images in localStorage
 * @param {string} equipmentId - Equipment ID
 * @param {string} imageUrl - Image URL to cache
 */
export const cacheEquipmentImage = (equipmentId, imageUrl) => {
  try {
    const cache = JSON.parse(window.localStorage.getItem('equipmentImageCache') || '{}');
    cache[String(equipmentId)] = imageUrl;
    window.localStorage.setItem('equipmentImageCache', JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching image:', error);
  }
};

/**
 * Get cached equipment image
 * @param {string} equipmentId - Equipment ID
 * @returns {string} - Cached image URL or empty string
 */
export const getCachedEquipmentImage = (equipmentId) => {
  try {
    const cache = JSON.parse(window.localStorage.getItem('equipmentImageCache') || '{}');
    return equipmentId ? cache[String(equipmentId)] || '' : '';
  } catch {
    return '';
  }
};

/**
 * Handle image load error by setting fallback
 * @param {Event} event - Image load error event
 * @param {string} fallback - Fallback image URL
 */
export const handleImageError = (event, fallback = PLACEHOLDERS.EQUIPMENT) => {
  if (event && event.currentTarget) {
    event.currentTarget.src = fallback;
  }
};

export default {
  PLACEHOLDERS,
  resolveImageUrl,
  getEquipmentImage,
  getUserAvatar,
  cacheEquipmentImage,
  getCachedEquipmentImage,
  handleImageError,
};
