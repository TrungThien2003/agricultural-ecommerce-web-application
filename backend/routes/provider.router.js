const express = require("express");
const {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
} = require("../controllers/provider.controllers.js");

const router = express.Router();

router.get("/", getAllProviders);

router.get("/:id", getProviderById);

router.post("/", createProvider);

router.put("/:id", updateProvider);

router.delete("/:id", deleteProvider);
module.exports = router;
