const express = require("express");
const router = express.Router();

const { getAllJobs, createJob, getJobById, updateJob, deleteJob } = require("../controllers/jobController");
const { applyForJob, getApplicationsForJob } = require("../controllers/applicationController");
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

// ─── Application Routes ───────────────────────────────────────────────────────
router.post(
  "/:id/apply",
  uploadResume.single("resume"),
  applyForJob
);
router.get("/:id/applications", getApplicationsForJob);

module.exports = router;
