const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application reference is required"],
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"],
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recruiter reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Interview date is required"],
    },
    time: {
      type: String,
      required: [true, "Interview time is required"],
      trim: true,
      maxlength: [20, "Time string cannot exceed 20 characters"],
    },
    mode: {
      type: String,
      required: [true, "Interview mode is required"],
      enum: {
        values: ["Online", "Offline"],
        message: "Interview mode must be Online or Offline",
      },
    },
    // Optional — only relevant when mode is Online
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// One interview per application at a time
interviewSchema.index({ applicationId: 1 }, { unique: true });

module.exports = mongoose.model("Interview", interviewSchema);