const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[6-9]\d{9}$|^\+?[1-9]\d{7,14}$/,
        "Please enter a valid phone number",
      ],
    },
    resumePath: {
      type: String,
      default: "",
    },

    // ── Logged-in candidate reference (null for guest applies) ────────────
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── ATS pipeline stage ────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: [
          "Applied",
          "Under Review",
          "Shortlisted",
          "Interview Scheduled",
          "Rejected",
          "Hired",
        ],
        message: "Invalid application status",
      },
      default: "Applied",
    },

    // ── Recruiter notes (embedded, timestamped) ───────────────────────────
    notes: [
      {
        text: {
          type: String,
          required: [true, "Note text is required"],
          trim: true,
          maxlength: [1000, "Note cannot exceed 1000 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications (same email per job)
applicationSchema.index({ job: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);