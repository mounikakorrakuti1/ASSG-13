const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recruiter reference is required"],
      index: true,
    },
    message: {
      type: String,
      required: [true, "Activity message is required"],
      trim: true,
      maxlength: [300, "Message cannot exceed 300 characters"],
    },
    // Optional — lets future code filter the feed by entity type
    entityType: {
      type: String,
      enum: {
        values: ["job", "application", "interview"],
        message: "entityType must be job, application, or interview",
      },
      default: null,
    },
    // Optional — the _id of the related document
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    // Only createdAt is needed; updatedAt is irrelevant for an audit log
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Auto-expire log entries after 30 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);