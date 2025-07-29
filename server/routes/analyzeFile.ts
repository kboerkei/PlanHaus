import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import xlsx from "xlsx";
import { requireAuth } from "../middleware/auth";
import { RequestWithUser } from "../types/express";
import { generateChatResponse } from "../services/ai/generateChatResponse";

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: "temp/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Excel, and CSV files are allowed!'));
    }
  }
});

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

router.post("/", upload.single("file"), requireAuth, async (req: RequestWithUser, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let extractedText = "";
    
    // Process based on file type
    if (file.mimetype === 'application/pdf') {
      // Handle PDF files - dynamic import to avoid loading issues
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(pdfBuffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        extractedText = `PDF file uploaded: ${file.originalname}. Unable to extract text content.`;
      }
      
    } else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel') || file.mimetype === 'text/csv') {
      // Handle Excel/CSV files
      const workbook = xlsx.readFile(file.path);
      const sheetNames = workbook.SheetNames;
      
      let allSheetData = "";
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        allSheetData += `\n\n--- Sheet: ${sheetName} ---\n`;
        jsonData.forEach((row: unknown) => {
          const rowArray = row as any[];
          if (rowArray && rowArray.length > 0) {
            allSheetData += rowArray.join(' | ') + '\n';
          }
        });
      });
      
      extractedText = allSheetData;
    }

    // Clean up the uploaded file
    fs.unlinkSync(file.path);

    if (!extractedText.trim()) {
      return res.status(400).json({ message: "Could not extract text from the file" });
    }

    // Determine file type for better AI prompting
    const fileType = file.mimetype === 'application/pdf' ? 'PDF document' : 'spreadsheet';
    
    // Create AI prompt for analysis
    const prompt = `
You're an expert wedding planning assistant. Analyze this uploaded ${fileType} and summarize its contents for the user.

File content:
${extractedText}
`;

    // Get AI analysis using the existing chat response system
    const aiAnalysis = await generateChatResponse({
      coupleNames: "the couple",
      currentPage: "file analysis"
    }, prompt);

    res.json({
      message: "File analyzed successfully",
      analysis: aiAnalysis,
      fileName: file.originalname,
      fileType: fileType,
      extractedLength: extractedText.length
    });

  } catch (error) {
    console.error('File analysis error:', error);
    
    // Clean up file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Only PDF, Excel')) {
      return res.status(400).json({ message: "Only PDF, Excel, and CSV files are allowed" });
    }
    
    res.status(500).json({ 
      message: "Failed to analyze file", 
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    });
  }
});

export default router;