const User = require("../models/User");
const Job = require("../models/Job");

// ─── GET /api/candidate/profile ──────────────────────────────────────────────
// Returns the logged-in jobseeker's full profile (incl. savedJobs count).
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching profile.", error: err.message });
  }
};

// ─── PUT /api/candidate/profile ──────────────────────────────────────────────
// Updates name, location, experience, and skills for the logged-in jobseeker.
const updateProfile = async (req, res) => {
  try {
    const { name, location, experience, skills } = req.body;

    // Build update object — only include fields that were sent
    const update = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Name must be at least 2 characters." });
      }
      update.name = name.trim();
    }

    if (location !== undefined) {
      update.location = String(location).trim().slice(0, 100);
    }

    if (experience !== undefined) {
      update.experience = String(experience).trim().slice(0, 1000);
    }

    if (skills !== undefined) {
      // Accept either an array or a comma-separated string
      let skillsArr = Array.isArray(skills)
        ? skills
        : String(skills).split(",");

      skillsArr = skillsArr
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 30); // cap at 30 skills

      update.skills = skillsArr;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    return res.status(200).json({ success: true, message: "Profile updated successfully.", data: user });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({ success: false, message: "Server error updating profile.", error: err.message });
  }
};

// ─── GET /api/candidate/saved-jobs ───────────────────────────────────────────
// Returns the jobseeker's bookmarked jobs (fully populated).
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("savedJobs")
      .populate({
        path: "savedJobs",
        populate: { path: "postedBy", select: "name email" },
      });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Filter out any nulls (jobs that were deleted after being saved)
    const jobs = user.savedJobs.filter(Boolean);

    return res.status(200).json({ success: true, total: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching saved jobs.", error: err.message });
  }
};

// ─── POST /api/candidate/saved-jobs/:jobId ────────────────────────────────────
// Bookmarks a job. Idempotent — saving the same job twice is a no-op.
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify the job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    // $addToSet prevents duplicates
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { savedJobs: jobId } },
      { new: true }
    ).select("savedJobs");

    return res.status(200).json({
      success: true,
      message: "Job saved successfully.",
      savedCount: user.savedJobs.length,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid job ID." });
    }
    res.status(500).json({ success: false, message: "Server error saving job.", error: err.message });
  }
};

// ─── DELETE /api/candidate/saved-jobs/:jobId ─────────────────────────────────
// Removes a bookmark. Idempotent.
const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedJobs: jobId } },
      { new: true }
    ).select("savedJobs");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    return res.status(200).json({
      success: true,
      message: "Job removed from saved list.",
      savedCount: user.savedJobs.length,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid job ID." });
    }
    res.status(500).json({ success: false, message: "Server error removing saved job.", error: err.message });
  }
};

module.exports = { getProfile, updateProfile, getSavedJobs, saveJob, unsaveJob };
