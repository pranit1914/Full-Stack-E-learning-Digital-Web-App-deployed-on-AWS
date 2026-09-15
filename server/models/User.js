import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    mainrole: {
      type: String,
      default: "user",
    },
    subscription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
      },
    ],
    about: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    experience: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    profilePic: {
      type: String,
      default: "",
    },
    certificates: [
      {
        name: { type: String, required: true },
        file: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordExpire: Date,
    resetPasswordToken: String,
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", schema);