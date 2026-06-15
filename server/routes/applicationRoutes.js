const express = require("express");
const router = express.Router();

const {
  updateApplicationStatus,
  addApplicationNote,
  updateApplicationNote,
  deleteApplicationNote,
  scheduleInterview,
  updateInterview,
  cancelInterview,
} = require("../controllers/applicationController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// ─── Application Status ────────────────────────────────────────────────────
// PATCH /api/applications/:id/status — recruiter only (ownership checked in controller)
router.patch(
  "/:id/status",
  verifyToken,
  checkRole(["recruiter"]),
  updateApplicationStatus
);

// ─── Recruiter Notes ────────────────────────────────────────────────────────
// POST   /api/applications/:id/notes
// PUT    /api/applications/:id/notes/:noteId
// DELETE /api/applications/:id/notes/:noteId
router.post(
  "/:id/notes",
  verifyToken,
  checkRole(["recruiter"]),
  addApplicationNote
);
router.put(
  "/:id/notes/:noteId",
  verifyToken,
  checkRole(["recruiter"]),
  updateApplicationNote
);
router.delete(
  "/:id/notes/:noteId",
  verifyToken,
  checkRole(["recruiter"]),
  deleteApplicationNote
);

// ─── Interview Management ──────────────────────────────────────────────────
// POST   /api/applications/:id/interview
// PUT    /api/applications/:id/interview
// DELETE /api/applications/:id/interview
router.post(
  "/:id/interview",
  verifyToken,
  checkRole(["recruiter"]),
  scheduleInterview
);
router.put(
  "/:id/interview",
  verifyToken,
  checkRole(["recruiter"]),
  updateInterview
);
router.delete(
  "/:id/interview",
  verifyToken,
  checkRole(["recruiter"]),
  cancelInterview
);

module.exports = router;