const express = require("express");
const router = express.Router();

const {
  createNote,
  getNotes,
  deleteNote,
  getDetails,
  removeDetailFromNote,
} = require("../controllers/inventory.controllers.js");

const {
  adminMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");

// Public
router.post("/note", adminMiddleware, createNote);
router.get("/notes", adminMiddleware, getNotes);
router.delete("/note/:id", adminMiddleware, deleteNote);
router.delete("/note/:noteId/detailId", removeDetailFromNote);
router.get("/notes/:id", adminMiddleware, getDetails);
router.put(
  "/note/:id",
  adminMiddleware,
  require("../controllers/inventory.controllers").updateNote
);

router.put(
  "/detail/:detailId",
  adminMiddleware,
  require("../controllers/inventory.controllers").updateDetail
);
module.exports = router;
