import express from "express";
import {
  longinUser,
  myProfile,
  register,
  verifyUser,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/user.js";

import { isAuth } from "../middlewares/isAuth.js";
import {
  loginRateLimit,
  registerRateLimit,
} from "../middlewares/rateLimit.js";
import { getLearningAnalytics, recordLearningEvent } from "../controllers/analytics.js";
import { uploadProfileFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/user/register", register);
router.post("/user/verify", verifyUser);
router.post("/user/login", longinUser);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password/:token", resetPassword);
router.get("/user/me", isAuth, myProfile);
router.put("/user/profile", isAuth, uploadProfileFiles, updateProfile);
router.get("/user/analytics", isAuth, getLearningAnalytics);
router.post("/user/analytics/events", isAuth, recordLearningEvent);

export default router;