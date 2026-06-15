const Job = require("../models/Job");

// ─── GET /api/jobs ───────────────────────────────────────────────────────────
const getAllJobs = async (req, res) => {
  try {
    const {
  search = "",
  jobType = "",
  sortBy = "",
  page = 1,
  limit = 9,
  location = "",
  company = "",
  minSalary = "",
  maxSalary = ""
} = req.query;

    const filter = {
  status: { $ne: "closed" }
};
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { company: { $regex: search.trim(), $options: "i" } },
      ];
    }
    if (jobType && ["Full Time", "Part Time", "Contract"].includes(jobType)) {
      filter.jobType = jobType;
    }
    // Location Filter
if (location.trim()) {
  filter.location = { $regex: location.trim(), $options: "i" };
}

// Company Filter
if (company.trim()) {
  filter.company = { $regex: company.trim(), $options: "i" };
}

// Salary Range Filter
if (minSalary || maxSalary) {
  filter.salary = {};

  if (minSalary) {
    filter.salary.$gte = Number(minSalary);
  }

  if (maxSalary) {
    filter.salary.$lte = Number(maxSalary);
  }
}

    let sort = { createdAt: -1 };
    if (sortBy === "salary_asc") sort = { salary: 1 };
    if (sortBy === "salary_desc") sort = { salary: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter).populate("postedBy", "name email").sort(sort).skip(skip).limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching jobs", error: error.message });
  }
};

// ─── POST /api/jobs ──────────────────────────────────────────────────────────
// Protected: recruiter only (enforced in route)
const createJob = async (req, res) => {
  try {
    const {
  title,
  company,
  location,
  jobType,
  salary,
  description
} = req.body;
let companyLogo = "";

if (req.file) {
  companyLogo = `/uploads/logos/${req.file.filename}`;
}

    if (!title || !company || !location || !jobType || salary === undefined || salary === "" || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: title, company, location, jobType, salary, description",
      });
    }

    if (isNaN(Number(salary)) || Number(salary) < 0) {
      return res.status(400).json({ success: false, message: "Salary must be a valid non-negative number" });
    }

    const job = await Job.create({
  title: title.trim(),
  company: company.trim(),
  companyLogo,
  location: location.trim(),
  jobType,
  salary: Number(salary),
  description: description.trim(),
  postedBy: req.user.id,
});

    await job.populate("postedBy", "name email");

    res.status(201).json({ success: true, message: "Job created successfully", data: job });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({ success: false, message: "Server error while creating job", error: error.message });
  }
};

// ─── GET /api/jobs/:id ───────────────────────────────────────────────────────
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ success: false, message: "Invalid job ID format" });
    res.status(500).json({ success: false, message: "Server error while fetching job", error: error.message });
  }
};

// ─── PUT /api/jobs/:id ───────────────────────────────────────────────────────
// Protected: recruiter + must be owner (enforced in route + here)
const updateJob = async (req, res) => {
  try {
    const { title, company, location, jobType, salary, description } = req.body;

    if (!title || !company || !location || !jobType || salary === undefined || salary === "" || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: title, company, location, jobType, salary, description",
      });
    }

    if (isNaN(Number(salary)) || Number(salary) < 0) {
      return res.status(400).json({ success: false, message: "Salary must be a valid non-negative number" });
    }

    // Find first to check ownership
    const existing = await Job.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Job not found" });

    if (existing.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only edit jobs you posted." });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), company: company.trim(), location: location.trim(), jobType, salary: Number(salary), description: description.trim() },
      { new: true, runValidators: true }
    ).populate("postedBy", "name email");

    res.status(200).json({ success: true, message: "Job updated successfully", data: job });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ success: false, message: "Invalid job ID format" });
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({ success: false, message: "Server error while updating job", error: error.message });
  }
};

// ─── DELETE /api/jobs/:id ────────────────────────────────────────────────────
// Protected: recruiter + must be owner (enforced in route + here)
const deleteJob = async (req, res) => {
  try {
    const existing = await Job.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Job not found" });

    if (existing.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete jobs you posted." });
    }

    await Job.findByIdAndDelete(req.params.id);

    const Application = require("../models/Application");
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({ success: true, message: "Job and its applications deleted successfully" });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ success: false, message: "Invalid job ID format" });
    res.status(500).json({ success: false, message: "Server error while deleting job", error: error.message });
  }
};

// ─── GET /api/recruiter/stats ─────────────────────────────────────────────────
// Protected: recruiter only. Returns this recruiter's jobs + application counts.
const getRecruiterStats = async (req, res) => {
  try {
    const Application = require("../models/Application");
    const recruiterId = req.user.id;

    // All jobs posted by this recruiter (newest first)
    const jobs = await Job.find({ postedBy: recruiterId }).sort({ createdAt: -1 });

    // Application counts for each job in one aggregation query
    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);

    // Map jobId → count
    const countMap = {};
    appCounts.forEach(({ _id, count }) => { countMap[_id.toString()] = count; });

    // Attach applicationCount to each job object
    const jobsWithCounts = jobs.map((j) => ({
      ...j.toObject(),
      applicationCount: countMap[j._id.toString()] || 0,
    }));

    const totalApplications = jobsWithCounts.reduce((sum, j) => sum + j.applicationCount, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalJobs: jobs.length,
        totalApplications,
        jobs: jobsWithCounts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching recruiter stats", error: error.message });
  }
};

// ─── PATCH /api/jobs/:id/status ──────────────────────────────────────────────
// Protected: recruiter + must be owner.
// Body: { "status": "open" | "closed" }
const patchJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status field is required.",
      });
    }
    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: open, closed.",
      });
    }

    // Fetch job and enforce ownership
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only change the status of jobs you posted.",
      });
    }

    // No-op guard — avoid a pointless write and log entry
    if (job.status === status) {
      return res.status(200).json({
        success: true,
        message: `Job is already ${status}.`,
        data: job,
      });
    }

    // Persist the status change
    job.status = status;
    await job.save();

    // Write activity log entry
    const ActivityLog = require("../models/ActivityLog");
    const action = status === "closed" ? "Closed" : "Reopened";
    await ActivityLog.create({
      recruiterId: req.user.id,
      message: `${action} job: ${job.title}`,
      entityType: "job",
      entityId: job._id,
    });

    return res.status(200).json({
      success: true,
      message: `Job ${status === "closed" ? "closed" : "reopened"} successfully.`,
      data: job,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid job ID format." });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating job status.",
      error: error.message,
    });
  }
};

module.exports = { getAllJobs, createJob, getJobById, updateJob, deleteJob, getRecruiterStats, patchJobStatus };