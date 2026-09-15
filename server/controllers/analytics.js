import { Courses } from "../models/Courses.js";
import { LearningAnalytics } from "../models/LearningAnalytics.js";
import { Lecture } from "../models/Lecture.js";
import { TryCatch } from "../middlewares/TryCatch.js";

const getOrCreateAnalytics = async (userId) =>
  LearningAnalytics.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, courses: [] } },
    { new: true, upsert: true },
  );

export const getLearningAnalytics = TryCatch(async (req, res) => {
  const analytics = await getOrCreateAnalytics(req.user._id);
  const courses = await Courses.find({ _id: req.user.subscription }).lean();
  const lectureCounts = await Lecture.aggregate([
    { $match: { course: { $in: req.user.subscription } } },
    { $group: { _id: "$course", total: { $sum: 1 } } },
  ]);
  const countByCourse = Object.fromEntries(lectureCounts.map((item) => [item._id.toString(), item.total]));
  const trackedByCourse = new Map(analytics.courses.map((item) => [item.course.toString(), item]));

  const courseAnalytics = courses.map((course) => {
    const tracked = trackedByCourse.get(course._id.toString());
    return {
      course,
      watchedSeconds: tracked?.watchedSeconds || 0,
      completedLectures: tracked?.completedLectures?.length || 0,
      totalLectures: countByCourse[course._id.toString()] || tracked?.totalLectures || 0,
      quizScores: tracked?.quizScores || [],
      lastActivity: tracked?.lastActivity || null,
    };
  });

  const allScores = courseAnalytics.flatMap((item) => item.quizScores);
  const weakTopics = allScores
    .reduce((topics, score) => {
      const current = topics.find((topic) => topic.topic.toLowerCase() === score.topic.toLowerCase());
      if (current) {
        current.total += score.score;
        current.count += 1;
      } else {
        topics.push({ topic: score.topic, total: score.score, count: 1 });
      }
      return topics;
    }, [])
    .map(({ topic, total, count }) => ({ topic, score: Math.round(total / count) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  res.json({
    analytics: {
      courses: courseAnalytics,
      totalWatchedSeconds: courseAnalytics.reduce((sum, item) => sum + item.watchedSeconds, 0),
      averageQuizScore: allScores.length
        ? Math.round(allScores.reduce((sum, item) => sum + item.score, 0) / allScores.length)
        : 0,
      weakTopics,
    },
  });
});

export const recordLearningEvent = TryCatch(async (req, res) => {
  const { courseId, lectureId, watchedSeconds = 0, completed = false, quiz } = req.body;
  if (!courseId || !(await Courses.exists({ _id: courseId }))) {
    return res.status(400).json({ message: "A valid course is required" });
  }
  if (!req.user.subscription.some((id) => id.toString() === courseId)) {
    return res.status(403).json({ message: "You have not subscribed to this course" });
  }

  const analytics = await getOrCreateAnalytics(req.user._id);
  let course = analytics.courses.find((item) => item.course.toString() === courseId);
  if (!course) {
    analytics.courses.push({ course: courseId, watchedSeconds: 0, quizScores: [] });
    course = analytics.courses[analytics.courses.length - 1];
  }

  course.watchedSeconds += Math.min(Math.max(Number(watchedSeconds) || 0, 0), 60);
  course.lastActivity = new Date();
  if (completed && lectureId && !course.completedLectures.some((id) => id.toString() === lectureId)) {
    course.completedLectures.push(lectureId);
  }
  if (quiz?.topic && Number.isFinite(Number(quiz.score))) {
    const score = Math.min(Math.max(Number(quiz.score), 0), 100);
    const existing = course.quizScores.find((item) => item.topic.toLowerCase() === quiz.topic.trim().toLowerCase());
    if (existing) {
      existing.score = score;
      existing.attempts += 1;
      existing.updatedAt = new Date();
    } else {
      course.quizScores.push({ topic: quiz.topic.trim().slice(0, 80), score });
    }
  }

  await analytics.save();
  res.json({ message: "Learning progress saved" });
});
