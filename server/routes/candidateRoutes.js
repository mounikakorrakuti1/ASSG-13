const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getCandidateApplications,
} = require("../controllers/candidateController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// All candidate routes require authentication + jobseeker role
router.use(verifyToken, checkRole(["jobseeker"]));

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// ─── Saved Jobs ───────────────────────────────────────────────────────────────
router.get("/saved-jobs", getSavedJobs);
router.get("/applications", getCandidateApplications);
router.post("/saved-jobs/:jobId", saveJob);
router.delete("/saved-jobs/:jobId", unsaveJob);

module.exports = router;
