/**
 * Equipment Routes
 */

const express = require("express");
const router = express.Router();

const equipmentController = require("../controllers/equipment.controller");
const { auth } = require("../middlewares/auth.middleware");
const { rbac } = require("../middlewares/rbac.middleware");
const { upload } = require("../middlewares/upload.middleware");

// Public - Get all equipment
router.get("/", equipmentController.getAllEquipment);

// Vendor - Create equipment
router.post("/", auth, rbac("VENDOR"), equipmentController.createEquipment);

// Vendor - Get own equipment list
router.get(
  "/vendor/my-equipment",
  auth,
  rbac("VENDOR"),
  equipmentController.getVendorEquipment
);

// Public - Get single equipment details
router.get("/:equipmentId", equipmentController.getEquipment);

// Vendor - Update equipment
router.put(
  "/:equipmentId",
  auth,
  rbac("VENDOR"),
  equipmentController.updateEquipment
);

// Vendor - Add equipment image
router.post(
  "/:equipmentId/images",
  auth,
  rbac("VENDOR"),
  upload.single("image"),
  equipmentController.addEquipmentImage
);

module.exports = router;