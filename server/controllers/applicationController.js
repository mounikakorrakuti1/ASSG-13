const Application = require("../models/Application");
const { sendApplicationEmail } = require("../utils/mailer");
const Job = require("../models/Job");

// ─── POST /api/jobs/:id/apply ─────────────────────────────────────────────────
const applyForJob = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    console.log("BODY:", req.body);
console.log("FILE:", req.file);

const resumePath = req.file
  ? `/uploads/resumes/${req.file.filename}`
  : "";
    const jobId = req.params.id;

    // Check job exists
    const job = await Job.findById(jobId)
  .populate("postedBy", "email name");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Field validation
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: fullName, email, phone",
      });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Phone validation (Indian 10-digit or international)
    const phoneRegex = /^[6-9]\d{9}$|^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number (10 digits for India)",
      });
    }

    const application = await Application.create({
  job: jobId,
  fullName: fullName.trim(),
  email: email.trim().toLowerCase(),
  phone: phone.trim(),
  resumePath,
});
await sendApplicationEmail(
  job.postedBy.email,
  application,
  job
);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! We will contact you soon.",
      data: application,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid job ID format" });
    }
    // Duplicate application
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job with this email address",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while submitting application",
      error: error.message,
    });
  }
};

// ─── GET /api/jobs/:id/applications ──────────────────────────────────────────
const getApplicationsForJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const applications = await Application.find({ job: jobId })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      total: applications.length,
      jobTitle: job.title,
      company: job.company,
      data: applications,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid job ID format" });
    }
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications",
      error: error.message,
    });
  }
};

module.exports = { applyForJob, getApplicationsForJob };
