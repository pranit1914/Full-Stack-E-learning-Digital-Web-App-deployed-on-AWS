import express from "express";
import { askTutor } from "../controllers/ai.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/ai/ask", isAuth, askTutor);

export default router;