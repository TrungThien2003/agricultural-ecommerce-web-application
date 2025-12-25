const express = require("express");
const router = express.Router();
const {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  getTypeTree,
  getAll,
} = require("../controllers/type.controllers.js");

// Public
router.get("/", getAllTypes);
router.get("/all", getAll);
router.get("/tree", getTypeTree);
router.get("/:id", getTypeById);

// Admin
router.post("/", createType);
router.put("/:id", updateType);
router.delete("/:id", deleteType);

module.exports = router;
