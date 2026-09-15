import { instance } from "../index.js";
import { TryCatch } from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import crypto from "crypto";
import { getMediaUrl } from "../utils/s3.js";

const courseWithMediaUrl = async (course) => {
  const value = course.toObject();
  value.image = await getMediaUrl(value.image);
  return value;
};

const lectureWithMediaUrl = async (lecture) => {
  const value = lecture.toObject();
  value.video = await getMediaUrl(value.video);
  return value;
};


export const getAllCourses=TryCatch(async(req, res)=>{
    
    const courses = await Courses.find();

    res.json({
    courses: await Promise.all(courses.map(courseWithMediaUrl)),
  });
});

export const getSingleCourse=TryCatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id);

  res.json({ course: await courseWithMediaUrl(course) });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture: await lectureWithMediaUrl(lecture) });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture: await lectureWithMediaUrl(lecture) });
});


export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture: await lectureWithMediaUrl(lecture) });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture: await lectureWithMediaUrl(lecture) });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });

  res.json({
    courses: await Promise.all(courses.map(courseWithMediaUrl)),
  });
});


export const checkout = TryCatch(async (req, res) => {
  if (!process.env.Razorpay_Key || !process.env.Razorpay_Secret) {
    return res.status(503).json({ message: "Payment gateway is not configured on the server" });
  }

  const user = await User.findById(req.user._id);

  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You already have this course",
    });
  }

  const options = {
    amount: Number(course.price * 100),
    currency: "INR",
    receipt: `course_${course._id}_${req.user._id}_${Date.now()}`.slice(0, 40),
  };

  if (!Number.isInteger(options.amount) || options.amount <= 0) {
    return res.status(400).json({ message: "Course price must be greater than zero" });
  }

  let order;
  try {
    order = await instance.orders.create(options);
  } catch (error) {
    const providerMessage = error.error?.description || error.description;
    if (error.statusCode === 401) {
      return res.status(503).json({ message: "Payment gateway credentials are invalid or expired" });
    }
    return res.status(502).json({ message: providerMessage || "Payment gateway could not create an order" });
  }

  res.status(201).json({
    order,
    course: await courseWithMediaUrl(course),
    keyId: process.env.Razorpay_Key,
  });
});


export const paymentVerification = TryCatch(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Incomplete payment response" });
  }

  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.Razorpay_Secret)
    .update(body)
    .digest("hex");

  const isAuthentic =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

  if (isAuthentic) {
    const user = await User.findById(req.user._id);

    if (user.subscription.includes(course._id)) {
      return res.status(400).json({ message: "You already have this course" });
    }

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    user.subscription.push(course._id);

    await user.save();

    res.status(200).json({
      message: "Course Purchased Successfully",
    });
  } else {
    return res.status(400).json({
      message: "Payment Failed",
    });
  }
});

export const getCourseLectures = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.subscription.some((courseId) => courseId.toString() === req.params.id)) {
    return res.status(403).json({ message: "You have not subscribed to this course" });
  }

  const lectures = await Lecture.find({ course: req.params.id }).sort({ createdAt: 1 });
  res.json({ lectures: await Promise.all(lectures.map(lectureWithMediaUrl)) });
});