const express = require("express");
const router = express.Router();

const { updateApplicationStatus } = require("../controllers/applicationController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

router.patch(
  "/:id/status",
  verifyToken,
  checkRole(["recruiter"]),
  updateApplicationStatus
);

module.exports = router;