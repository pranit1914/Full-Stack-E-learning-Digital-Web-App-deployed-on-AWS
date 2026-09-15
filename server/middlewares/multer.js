import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuid } from "uuid";

const uploadDirectory = path.join(os.tmpdir(), "e-learning-uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024,
  },
});

export const uploadFiles = upload.single("file");

export const uploadProfileFiles = upload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
]);