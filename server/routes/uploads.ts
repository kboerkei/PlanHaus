import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded." });

  // Move or rename if needed:
  const tempPath = file.path;
  const targetPath = path.join(process.cwd(), "uploads", file.originalname);

  fs.rename(tempPath, targetPath, (err) => {
    if (err) return res.status(500).json({ message: "File move error." });

    res.json({
      message: "File uploaded successfully!",
      fileUrl: `/uploads/${file.originalname}`,
    });
  });
});

export default router;