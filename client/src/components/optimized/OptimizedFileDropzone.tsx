import { memo, useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIntersectionObserver } from "@/hooks/usePerformanceOptimization";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploadState {
  file: File;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  result?: string;
  error?: string;
}

interface OptimizedFileDropzoneProps {
  onFileAnalyzed?: (filename: string, analysis: string) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  className?: string;
}

export const OptimizedFileDropzone = memo(({ 
  onFileAnalyzed,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.xlsx', '.xls', '.csv'],
  className
}: OptimizedFileDropzoneProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadState[]>([]);
  const { toast } = useToast();
  
  // Intersection observer for performance optimization
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(dropzoneRef, { threshold: 0.1 });
  const isVisible = !!entry?.isIntersecting;

  const analyzeFile = useCallback(async (file: File): Promise<string> => {
    const sessionId = localStorage.getItem('sessionId');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/analyzeFile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionId}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.analysis || 'File analyzed successfully';
  }, []);

  const processFile = useCallback(async (file: File) => {
    const fileState: FileUploadState = {
      file,
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, fileState]);

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, progress, status: progress === 100 ? 'analyzing' : 'uploading' }
              : f
          )
        );
      }

      // Analyze the file
      const analysis = await analyzeFile(file);
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'completed', result: analysis, progress: 100 }
            : f
        )
      );

      onFileAnalyzed?.(file.name, analysis);
      
      toast({
        title: "File analyzed successfully",
        description: `${file.name} has been processed and added to your chat.`,
      });

    } catch (error) {
      console.error('File analysis error:', error);
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.file === file 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Analysis failed',
                progress: 0
              }
            : f
        )
      );

      toast({
        title: "Analysis failed",
        description: `Failed to analyze ${file.name}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [analyzeFile, onFileAnalyzed, toast]);

  const removeFile = useCallback((fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  }, []);

  const retryFile = useCallback((fileToRetry: File) => {
    processFile(fileToRetry);
  }, [processFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesToProcess = acceptedFiles.slice(0, maxFiles - uploadedFiles.length);
    
    if (filesToProcess.length < acceptedFiles.length) {
      toast({
        title: "Too many files",
        description: `Only ${maxFiles} files allowed. Processing first ${filesToProcess.length} files.`,
        variant: "destructive",
      });
    }

    filesToProcess.forEach(processFile);
  }, [maxFiles, uploadedFiles.length, processFile, toast]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[`application/${type.slice(1)}`] = [type];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxSizeBytes,
    disabled: uploadedFiles.length >= maxFiles
  });

  // Performance optimization: only render when visible
  if (!isVisible) {
    return <div ref={dropzoneRef} className="h-32" />;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileUploadState['status']) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: FileUploadState['status']) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div ref={dropzoneRef} className={cn("space-y-4", className)}>
      {/* Dropzone Area */}
      <motion.div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive && !isDragReject && "border-blue-400 bg-blue-50",
          isDragReject && "border-red-400 bg-red-50",
          !isDragActive && "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          uploadedFiles.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
        whileHover={uploadedFiles.length < maxFiles ? { scale: 1.02 } : {}}
        whileTap={uploadedFiles.length < maxFiles ? { scale: 0.98 } : {}}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <Upload className="h-6 w-6 text-gray-600" />
          </motion.div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? "Drop files here" : "Upload documents for analysis"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop or click to select files ({acceptedTypes.join(', ')})
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max {maxFiles} files, {formatFileSize(maxSizeBytes)} each
            </p>
          </div>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {uploadedFiles.map((fileState, index) => (
              <motion.div
                key={`${fileState.file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn("p-4", getStatusColor(fileState.status))}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {fileState.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(fileState.file.size)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(fileState.status)}
                            <span className="text-xs text-gray-600 capitalize">
                              {fileState.status === 'analyzing' ? 'Analyzing...' : fileState.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {fileState.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryFile(fileState.file)}
                          className="h-7 px-2"
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(fileState.file)}
                        className="h-7 w-7 p-0 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {(fileState.status === 'uploading' || fileState.status === 'analyzing') && (
                    <div className="mt-3">
                      <Progress value={fileState.progress} className="h-2" />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {fileState.status === 'error' && fileState.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                      {fileState.error}
                    </div>
                  )}
                  
                  {/* Analysis Result Preview */}
                  {fileState.status === 'completed' && fileState.result && (
                    <div className="mt-3 p-3 bg-white rounded border text-sm">
                      <p className="text-gray-700 line-clamp-3">
                        {fileState.result.slice(0, 200)}...
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

OptimizedFileDropzone.displayName = "OptimizedFileDropzone";