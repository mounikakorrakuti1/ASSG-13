const Job = require("../models/Job");
const Application = require("../models/Application");
const ActivityLog = require("../models/ActivityLog");

// ─── GET /api/recruiter/stats ─────────────────────────────────────────────────
// Protected: recruiter only. Returns this recruiter's jobs + application counts.
const getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ postedBy: recruiterId }).sort({ createdAt: -1 });

    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    appCounts.forEach(({ _id, count }) => { countMap[_id.toString()] = count; });

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

// ─── GET /api/recruiter/analytics ────────────────────────────────────────────
// Protected: recruiter only.
const getRecruiterAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ postedBy: recruiterId });
    const jobIds = jobs.map((j) => j._id);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === "open").length;
    const closedJobs = jobs.filter((j) => j.status === "closed").length;

    // Applications per job (counts)
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    appCounts.forEach(({ _id, count }) => { countMap[_id.toString()] = count; });

    const applicationsPerJob = jobs.map((j) => ({
      jobId: j._id,
      title: j.title,
      applicationCount: countMap[j._id.toString()] || 0,
    }));

    const totalApplicants = applicationsPerJob.reduce((sum, j) => sum + j.applicationCount, 0);

    // Status-based counts across all applications for this recruiter's jobs
    const statusCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    statusCounts.forEach(({ _id, count }) => { statusMap[_id] = count; });

    const shortlisted = statusMap["Shortlisted"] || 0;
    const rejected = statusMap["Rejected"] || 0;
    const hired = statusMap["Hired"] || 0;

    // Top performing job — job with the most applications
    let topPerformingJob = null;
    if (applicationsPerJob.length > 0) {
      const top = applicationsPerJob.reduce((max, j) =>
        j.applicationCount > max.applicationCount ? j : max
      , applicationsPerJob[0]);

      if (top.applicationCount > 0) {
        topPerformingJob = {
          jobId: top.jobId,
          title: top.title,
          applicationCount: top.applicationCount,
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplicants,
        shortlisted,
        rejected,
        hired,
        topPerformingJob,
        applicationsPerJob,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching recruiter analytics",
      error: error.message,
    });
  }
};

// ─── GET /api/recruiter/activity ─────────────────────────────────────────────
// Protected: recruiter only. Returns latest 10 activity log entries.
const getRecruiterActivity = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const activities = await ActivityLog.find({ recruiterId })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      total: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching recruiter activity",
      error: error.message,
    });
  }
};

module.exports = {
  getRecruiterStats,
  getRecruiterAnalytics,
  getRecruiterActivity,
};