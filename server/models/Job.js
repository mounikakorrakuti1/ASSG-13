const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    companyLogo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: {
        values: ["Full Time", "Part Time", "Contract"],
        message: "Job type must be Full Time, Part Time, or Contract",
      },
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["open", "closed"],
        message: "Job status must be open or closed",
      },
      default: "open",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job must be associated with a recruiter"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for search performance
jobSchema.index({ title: "text", company: "text" });

module.exports = mongoose.model("Job", jobSchema);