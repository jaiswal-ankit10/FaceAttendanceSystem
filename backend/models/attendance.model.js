import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    checkInTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Late"],
      default: "Present",
    },

    confidence: {
      type: Number, // face distance score
      required: true,
    },

    device: {
      type: String,
      default: "Web",
    },

    location: {
      type: String,
    },
  },
  { timestamps: true },
);

// Prevent duplicate attendance per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
