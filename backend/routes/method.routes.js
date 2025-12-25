const express = require("express");
const router = express.Router();
const {
  getAllMethods,
  createMethod,
} = require("../controllers/method.controllers.js");
// Public
router.get("/", getAllMethods);
router.post("/", createMethod);
module.exports = router;
