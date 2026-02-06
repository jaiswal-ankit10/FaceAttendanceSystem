import mongoose from "mongoose";

const FaceDescriptorSchema = new mongoose.Schema(
  {
    descriptor: {
      type: [Number],
      required: true,
    },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    empId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // email: {
    //   type: String,
    //   lowercase: true,
    //   unique: true,
    //   sparse: true,
    // },

    // role: {
    //   type: String,
    //   enum: ["admin", "user"],
    //   default: "user",
    // },

    faceDescriptors: {
      type: [FaceDescriptorSchema],
      validate: [arrayLimit, "Max 5 face samples allowed"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

function arrayLimit(val) {
  return val.length <= 5;
}

export const User = mongoose.model("User", UserSchema);
