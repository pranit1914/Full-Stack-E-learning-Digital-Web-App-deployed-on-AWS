import { TryCatch } from "../middlewares/TryCatch.js";
import {Courses} from "../models/Courses.js"
//import { Lecture } from "../models/Lecture.js";
import { Lecture } from "../models/Lecture.js";
import {rm} from "fs";
import fs from "fs";
import { promisify } from "util";
import { User } from "../models/User.js";
import { deleteFromS3, getMediaUrl, uploadToS3 } from "../utils/s3.js";

export const createCourse=TryCatch(async(req,res)=>{
    
    const { title, description, category, createdBy, duration, price } = req.body;

    const image=req.file;

    if (!image) {
      return res.status(400).json({ message: "Course image is required" });
    }

    console.log("BODY:", req.body);
  console.log("FILE:", req.file);

    await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image ? await uploadToS3(image, "courses/images") : undefined,
    duration,
    price,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  });

})

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  const { title, description } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Lecture video is required" });
  }

  const lecture = await Lecture.create({
    title,
    description,
    video: await uploadToS3(file, "courses/videos"),
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture: {
      ...lecture.toObject(),
      video: await getMediaUrl(lecture.video),
    },
  });
});


export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  await deleteFromS3(lecture.video);

  await lecture.deleteOne(); //db se bhi delete hogaya

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse=TryCatch(async(req,res)=>{
   const course = await Courses.findById(req.params.id); //feteh course from db of Course

  const lectures = await Lecture.find({ course: course._id });// go in db find all lecture belong to this course each lec has reference course:course._id

  await Promise.all(  //runs all deletions in parallel (fast) instead of one-by-one
    lectures.map(async (lecture) => { //Loop through all lectures..........Delete each video file from storage (local/cloud)
      if (lecture.video.startsWith("s3://")) {
        await deleteFromS3(lecture.video);
      } else {
        await unlinkAsync(lecture.video).catch(() => {});
      }
    })
  );

  await deleteFromS3(course.image);

  await Lecture.find({ course: req.params.id }).deleteMany();//Delete all lecture documents from database ...Important: first files deleted, then DB records

  await course.deleteOne(); //Delete the course itself from database

  await User.updateMany({}, { $pull: { subscription: req.params.id } }); //Remove this course ID from all users' subscriptions

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});



