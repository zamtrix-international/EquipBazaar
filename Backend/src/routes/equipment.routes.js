/**
 * Equipment Routes
 */

const express = require("express");
const router = express.Router();

const equipmentController = require("../controllers/equipment.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");
const { upload } = require("../middlewares/upload.middleware");

// Create equipment
router.post("/", auth, rbac("VENDOR"), equipmentController.createEquipment);

// Get vendor equipment
router.get(
  "/vendor/my-equipment",
  auth,
  rbac("VENDOR"),
  equipmentController.getVendorEquipment
);

// Get equipment
router.get("/:equipmentId", equipmentController.getEquipment);

// Update equipment
router.put(
  "/:equipmentId",
  auth,
  rbac("VENDOR"),
  equipmentController.updateEquipment
);

// Add equipment image
router.post(
  "/:equipmentId/images",
  auth,
  rbac("VENDOR"),
  upload.single("image"),
  equipmentController.addEquipmentImage
);

module.exports = router;
