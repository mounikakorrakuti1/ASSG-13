const Application = require("../models/Application");
const Job = require("../models/Job");
const Interview = require("../models/Interview");
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
const getApplicationsForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { search, status } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view applicants for this job",
      });
    }

    const query = { job: jobId };

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

// ─── Helper: load application + verify recruiter owns the job ───────────────
const loadOwnedApplication = async (applicationId, recruiterId) => {
  const application = await Application.findById(applicationId).populate("job");
  if (!application) {
    return { error: { status: 404, message: "Application not found" } };
  }
  if (application.job.postedBy.toString() !== recruiterId.toString()) {
    return {
      error: {
        status: 403,
        message: "You are not authorized to modify this application",
      },
    };
  }
  return { application };
};

// ─── POST /api/applications/:id/notes ────────────────────────────────────────
const addApplicationNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Note text is required" });
    }

    const { application, error } = await loadOwnedApplication(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    application.notes.push({ text: text.trim() });
    await application.save();

    const addedNote = application.notes[application.notes.length - 1];

    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `Note added for ${application.fullName} (${application.email}) — Job: ${application.job.title}`,
      entityType: "application",
      entityId: application._id,
    });

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: addedNote,
      notes: application.notes,
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
      message: "Server error while adding note",
      error: error.message,
    });
  }
};

// ─── PUT /api/applications/:id/notes/:noteId ─────────────────────────────────
const updateApplicationNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Note text is required" });
    }

    const { application, error } = await loadOwnedApplication(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    const note = application.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    note.text = text.trim();
    note.updatedAt = new Date();
    await application.save();

    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `Note updated for ${application.fullName} (${application.email}) — Job: ${application.job.title}`,
      entityType: "application",
      entityId: application._id,
    });

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
      notes: application.notes,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating note",
      error: error.message,
    });
  }
};

// ─── DELETE /api/applications/:id/notes/:noteId ──────────────────────────────
const deleteApplicationNote = async (req, res) => {
  try {
    const { application, error } = await loadOwnedApplication(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    const note = application.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    note.deleteOne();
    await application.save();

    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `Note deleted for ${application.fullName} (${application.email}) — Job: ${application.job.title}`,
      entityType: "application",
      entityId: application._id,
    });

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      notes: application.notes,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting note",
      error: error.message,
    });
  }
};

// ─── POST /api/applications/:id/interview ────────────────────────────────────
const scheduleInterview = async (req, res) => {
  try {
    const { date, time, mode, meetingLink, remarks } = req.body;

    const allowedModes = ["Online", "Offline"];

    if (!date || !time || !mode) {
      return res.status(400).json({
        success: false,
        message: "date, time, and mode are required",
      });
    }

    if (!allowedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mode. Allowed values: ${allowedModes.join(", ")}`,
      });
    }

    const { application, error } = await loadOwnedApplication(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    const existing = await Interview.findOne({ applicationId: application._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An interview is already scheduled for this application. Use PUT to update it.",
      });
    }

    const interview = await Interview.create({
      applicationId: application._id,
      jobId: application.job._id,
      recruiterId: req.user.id,
      date,
      time,
      mode,
      meetingLink: meetingLink ? meetingLink.trim() : "",
      remarks: remarks ? remarks.trim() : "",
    });

    application.status = "Interview Scheduled";
    await application.save();

    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `Interview scheduled for ${application.fullName} (${application.email}) — Job: ${application.job.title}`,
      entityType: "interview",
      entityId: interview._id,
    });

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: interview,
      applicationStatus: application.status,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An interview already exists for this application",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while scheduling interview",
      error: error.message,
    });
  }
};

// ─── PUT /api/applications/:id/interview ─────────────────────────────────────
const updateInterview = async (req, res) => {
  try {
    const { date, time, mode, meetingLink, remarks } = req.body;
    const allowedModes = ["Online", "Offline"];

    if (mode && !allowedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mode. Allowed values: ${allowedModes.join(", ")}`,
      });
    }

    const { application, error } = await loadOwnedApplication(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    const interview = await Interview.findOne({ applicationId: application._id });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "No interview found for this application. Use POST to schedule one.",
      });
    }

    if (date !== undefined) interview.date = date;
    if (time !== undefined) interview.time = time;
    if (mode !== undefined) interview.mode = mode;
    if (meetingLink !== undefined) interview.meetingLink = meetingLink.trim();
    if (remarks !== undefined) interview.remarks = remarks.trim();

    await interview.save();

    // Ensure status reflects an active scheduled interview
    if (application.status !== "Interview Scheduled") {
      application.status = "Interview Scheduled";
      await application.save();
    }

    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `Interview details updated for ${application.fullName} (${application.email}) — Job: ${application.job.title}`,
      entityType: "interview",
      entityId: interview._id,
    });

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: interview,
      applicationStatus: application.status,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating interview",
      error: error.message,
    });
  }
};

// ─── DELETE /api/applications/:id/interview ──────────────────────────────────
// Cancels (deletes) the interview. Reverts status to "Shortlisted" if the
// application was in "Interview Scheduled" state.
const cancelInterview = async (req, res) => {
  try {
    const { application, error } = await loadOwnedApplication(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    const interview = await Interview.findOneAndDelete({ applicationId: application._id });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "No interview found for this application",
      });
    }

    let statusReverted = false;
    if (application.status === "Interview Scheduled") {
      application.status = "Shortlisted";
      await application.save();
      statusReverted = true;
    }

    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `Interview cancelled for ${application.fullName} (${application.email}) — Job: ${application.job.title}`,
      entityType: "interview",
      entityId: interview._id,
    });

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully",
      statusReverted,
      applicationStatus: application.status,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({
      success: false,
      message: "Server error while cancelling interview",
      error: error.message,
    });
  }
};

module.exports = {
  applyForJob,
  getApplicationsForJob,
  updateApplicationStatus,
  addApplicationNote,
  updateApplicationNote,
  deleteApplicationNote,
  scheduleInterview,
  updateInterview,
  cancelInterview,
};