const Application = require("../models/Application");
const Job = require("../models/Job");
const ActivityLog = require("../models/ActivityLog");
const { sendApplicationEmail } = require("../utils/mailer");

// ─── POST /api/jobs/:id/apply ─────────────────────────────────────────────────
const applyForJob = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    const resumePath = req.file
      ? `/uploads/resumes/${req.file.filename}`
      : "";
    const jobId = req.params.id;

    const job = await Job.findById(jobId).populate("postedBy", "email name");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: fullName, email, phone",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

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
      applicant: req.user ? req.user.id : null,
    });

    await sendApplicationEmail(job.postedBy.email, application, job);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! We will contact you soon.",
      data: application,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid job ID format" });
    }
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
// recruiter only — only the recruiter who created the job can view applicants
// supports: ?search=<name or email>  &status=<status>
const getApplicationsForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { search, status } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Ownership check — only the recruiter who created the job can view applicants
    if (job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view applicants for this job",
      });
    }

    const query = { job: jobId };

    // Status filter
    if (status) {
      const allowedStatuses = [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Rejected",
        "Hired",
      ];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed values: ${allowedStatuses.join(", ")}`,
        });
      }
      query.status = status;
    }

    // Search by applicant name or email (case-insensitive)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ fullName: searchRegex }, { email: searchRegex }];
    }

    const applications = await Application.find(query)
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

// ─── PATCH /api/applications/:id/status ──────────────────────────────────────
// recruiter only — only the recruiter who owns the job can update status
const updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Interview Scheduled",
      "Rejected",
      "Hired",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Ownership check — only the recruiter who created the job can update status
    if (application.job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this application",
      });
    }

    const previousStatus = application.status;

    if (previousStatus === status) {
      return res.status(200).json({
        success: true,
        message: "Status unchanged",
        data: application,
      });
    }

    application.status = status;
    await application.save();

    // Create ActivityLog entry for status change
    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `Application status changed from "${previousStatus}" to "${status}" for ${application.fullName} (${application.email}) — Job: ${application.job.title}`,
      entityType: "application",
      entityId: application._id,
    });

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid application ID format" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating application status",
      error: error.message,
    });
  }
};

module.exports = {
  applyForJob,
  getApplicationsForJob,
  updateApplicationStatus,
};