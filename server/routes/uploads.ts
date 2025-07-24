import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

router.post("/", requireAuth, upload.array('images', 10), async (req: RequestWithUser, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    logInfo('uploads', `${files.length} files uploaded`, { 
      userId: req.userId,
      files: uploadedFiles.map(f => f.originalname)
    });

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
      urls: uploadedFiles.map(f => f.url)
    });
  } catch (error) {
    logError('uploads', error, { userId: req.userId });
    
    if (error.message.includes('Only image files')) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    
    res.status(500).json({ message: "File upload failed" });
  }
});

// Serve uploaded files
router.get("/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filepath);
  } catch (error) {
    logError('uploads', error, { filename: req.params.filename });
    res.status(500).json({ message: "Failed to serve file" });
  }
});

export default router;