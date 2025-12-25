const express = require("express");
const router = express.Router();
const {
  getAllStandards,
  createStandard,
} = require("../controllers/standard.controller.js");

router.get("/", getAllStandards);
router.post("/", createStandard);
module.exports = router;
