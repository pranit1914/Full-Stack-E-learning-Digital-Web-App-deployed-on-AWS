import express from 'express';
import { checkout, getAllCourses, getCourseLectures, getMyCourses, getSingleCourse, paymentVerification } from '../controllers/course.js';
import { isAuth } from '../middlewares/isAuth.js';
import {fetchLectures } from '../controllers/course.js'
import {fetchLecture } from '../controllers/course.js'

const router=express.Router();

router.get('/course/all', getAllCourses);
router.get('/course/:id', getSingleCourse);
router.get('/lectures/:id', isAuth, fetchLectures);
router.get('/lecture/:id', isAuth, fetchLecture);
router.get('/mycourse' , isAuth, getMyCourses);
router.get('/course/:id/lectures', isAuth, getCourseLectures);
router.post('/course/checkout/:id', isAuth, checkout);
router.post('/verification/:id', isAuth, paymentVerification);

export default router;