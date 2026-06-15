const express = require("express");
const router = express.Router();

const { getAllJobs, createJob, getJobById, updateJob, deleteJob, patchJobStatus } = require("../controllers/jobController");
const {
  applyForJob,
  getApplicationsForJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const uploadResume = require("../middleware/uploadResume");
const uploadLogo = require("../middleware/uploadLogo");

// ─── Job Routes ───────────────────────────────────────────────────────────────
// GET  /api/jobs          — public
// POST /api/jobs          — recruiter only
router.get("/", getAllJobs);
router.post(
  "/",
  verifyToken,
  checkRole(["recruiter"]),
  uploadLogo.single("companyLogo"),
  createJob
);

// GET    /api/jobs/:id    — public
// PUT    /api/jobs/:id    — recruiter only (ownership checked in controller)
// DELETE /api/jobs/:id    — recruiter only (ownership checked in controller)
router.get("/:id", getJobById);
router.put("/:id", verifyToken, checkRole(["recruiter"]), updateJob);
router.delete("/:id", verifyToken, checkRole(["recruiter"]), deleteJob);

// PATCH  /api/jobs/:id/status — recruiter only (ownership checked in controller)
router.patch("/:id/status", verifyToken, checkRole(["recruiter"]), patchJobStatus);

// ─── Application Routes ───────────────────────────────────────────────────────
router.post(
  "/:id/apply",
  uploadResume.single("resume"),
  applyForJob
);

// GET /api/jobs/:id/applications — recruiter only (ownership checked in controller)
router.get(
  "/:id/applications",
  verifyToken,
  checkRole(["recruiter"]),
  getApplicationsForJob
);

module.exports = router;