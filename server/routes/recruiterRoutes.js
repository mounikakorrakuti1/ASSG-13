const express = require("express");
const router = express.Router();
const { getRecruiterStats } = require("../controllers/jobController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// GET /api/recruiter/stats — recruiter only
router.get("/stats", verifyToken, checkRole(["recruiter"]), getRecruiterStats);

module.exports = router;
