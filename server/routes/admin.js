import express from 'express';
import {isAuth } from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAuth.js';
import { createCourse, deleteCourse, deleteLecture, getAllStats } from '../controllers/admin.js';
import { uploadFiles } from '../middlewares/multer.js';
import { addLectures } from '../controllers/admin.js';
//import { deleteLecture } from '../controllers/admin.js';

const router=express.Router();

router.post('/course/new',isAuth, isAdmin, uploadFiles, createCourse);
router.post('/course/:id', isAuth, isAdmin, uploadFiles, addLectures);
router.delete('/lecture/:id', isAuth, isAdmin, deleteLecture);
router.delete('/course/:id',isAuth, isAdmin, deleteCourse);
router.get('/stats', isAuth, isAdmin, getAllStats);

export default router;