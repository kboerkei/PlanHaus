import { memo, useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { sanitizeFileName, validateFileType, validateFileSize } from '@/utils/sanitize';
import { useToast as useToastHook } from '@/hooks/use-toast';

interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  analysis?: string;
  error?: string;
  progress?: number;
}

interface OptimizedFileDropzoneProps {
  onAnalysisComplete?: (fileName: string, analysis: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

// Memoized file item component
const FileItem = memo(({ 
  uploadedFile, 
  index, 
  onRemove 
}: { 
  uploadedFile: UploadedFile; 
  index: number; 
  onRemove: (index: number) => void;
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all duration-300
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {uploadedFile.status === 'uploading' && (
            <Loader2 className="w-5 h-5 text-champagne animate-spin" />
          )}
          {uploadedFile.status === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {uploadedFile.status === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {sanitizeFileName(uploadedFile.file.name)}
            </p>
            <button
              onClick={() => onRemove(index)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mb-2">
            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
          </p>

          {/* Progress bar for uploading */}
          {uploadedFile.status === 'uploading' && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm text-champagne mb-1">
                <div className="w-2 h-2 bg-champagne rounded-full animate-pulse"></div>
                Analyzing document...
              </div>
              {uploadedFile.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-champagne h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadedFile.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {uploadedFile.status === 'error' && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                {uploadedFile.error}
              </p>
            </div>
          )}

          {uploadedFile.status === 'success' && uploadedFile.analysis && (
            <div className="mt-3 p-3 bg-soft-gold/10 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">AI Analysis:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {uploadedFile.analysis}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FileItem.displayName = 'FileItem';

export const OptimizedFileDropzone = memo(({ 
  onAnalysisComplete, 
  maxFiles = 5,
  maxSizeMB = 10
}: OptimizedFileDropzoneProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToastHook();
  const abortController = useRef<AbortController>();

  const analyzeFile = useCallback(async (file: File, index: number) => {
    const formData = new FormData();
    formData.append('file', file);

    // Create new abort controller for this request
    abortController.current = new AbortController();

    try {
      const sessionId = localStorage.getItem('sessionId');
      
      // Simulate progress updates
      setUploadedFiles(prev => 
        prev.map((f, i) => i === index ? { ...f, progress: 20 } : f)
      );

      const response = await fetch('/api/analyzeFile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
        body: formData,
        signal: abortController.current.signal,
      });

      setUploadedFiles(prev => 
        prev.map((f, i) => i === index ? { ...f, progress: 80 } : f)
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      
      setUploadedFiles(prev => 
        prev.map((f, i) => i === index ? { ...f, progress: 100 } : f)
      );

      return result.analysis;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Analysis cancelled');
      }
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Validate file count
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive'
      });
      return;
    }

    // Validate each file
    const validFiles = acceptedFiles.filter(file => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];

      if (!validateFileType(file, allowedTypes)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported file type`,
          variant: 'destructive'
        });
        return false;
      }

      if (!validateFileSize(file, maxSizeMB)) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds ${maxSizeMB}MB limit`,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add files with uploading status
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      status: 'uploading' as const,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file with proper error handling
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileIndex = uploadedFiles.length + i;
      
      try {
        const analysis = await analyzeFile(file, fileIndex);
        
        setUploadedFiles(prev => 
          prev.map((uploadedFile, index) => 
            index === fileIndex 
              ? { ...uploadedFile, status: 'success', analysis, progress: undefined }
              : uploadedFile
          )
        );

        // Call callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(file.name, analysis);
        }

        toast({
          title: 'Analysis complete',
          description: `Successfully analyzed ${file.name}`
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        
        setUploadedFiles(prev => 
          prev.map((uploadedFile, index) => 
            index === fileIndex 
              ? { ...uploadedFile, status: 'error', error: errorMessage, progress: undefined }
              : uploadedFile
          )
        );

        toast({
          title: 'Analysis failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  }, [uploadedFiles.length, maxFiles, maxSizeMB, toast, analyzeFile, onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: true,
    disabled: uploadedFiles.length >= maxFiles,
  });

  const clearFiles = useCallback(() => {
    // Cancel any ongoing requests
    if (abortController.current) {
      abortController.current.abort();
    }
    setUploadedFiles([]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject 
            ? 'border-blush bg-blush/10 scale-105' 
            : isDragReject 
            ? 'border-red-400 bg-red-50' 
            : uploadedFiles.length >= maxFiles
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-champagne hover:border-blush hover:bg-blush/5'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <Upload 
            className={`w-12 h-12 ${
              isDragActive ? 'text-blush' : 
              uploadedFiles.length >= maxFiles ? 'text-gray-400' :
              'text-champagne'
            }`} 
          />
          
          {uploadedFiles.length >= maxFiles ? (
            <p className="text-gray-500 font-medium">
              Maximum files reached ({maxFiles})
            </p>
          ) : isDragActive ? (
            isDragReject ? (
              <p className="text-red-600 font-medium">
                Only PDF, Excel, and CSV files are accepted
              </p>
            ) : (
              <p className="text-blush font-medium">
                Drop your files here...
              </p>
            )
          ) : (
            <>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  Drop wedding documents here
                </p>
                <p className="text-sm text-gray-600">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Accepts PDF, Excel (.xlsx, .xls), and CSV files up to {maxSizeMB}MB
                <br />
                Maximum {maxFiles} files ({uploadedFiles.length}/{maxFiles} used)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <button
              onClick={clearFiles}
              className="text-sm text-champagne hover:text-blush transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-4">
            {uploadedFiles.map((uploadedFile, index) => (
              <FileItem
                key={`${uploadedFile.file.name}-${index}`}
                uploadedFile={uploadedFile}
                index={index}
                onRemove={removeFile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedFileDropzone.displayName = 'OptimizedFileDropzone';