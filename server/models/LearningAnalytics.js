import mongoose from "mongoose";

const quizScoreSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, trim: true },
    score: { type: Number, min: 0, max: 100, required: true },
    attempts: { type: Number, default: 1 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const courseAnalyticsSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Courses", required: true },
    watchedSeconds: { type: Number, default: 0, min: 0 },
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],
    totalLectures: { type: Number, default: 0, min: 0 },
    quizScores: [quizScoreSchema],
    lastActivity: { type: Date, default: Date.now },
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    courses: [courseAnalyticsSchema],
  },
  { timestamps: true },
);

export const LearningAnalytics = mongoose.model("LearningAnalytics", schema);
