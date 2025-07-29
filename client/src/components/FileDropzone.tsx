import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  analysis?: string;
  error?: string;
}

interface FileDropzoneProps {
  onAnalysisComplete?: (fileName: string, analysis: string) => void;
}

export default function FileDropzone({ onAnalysisComplete }: FileDropzoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const analyzeFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/analyzeFile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      return result.analysis;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Add files with uploading status
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        const analysis = await analyzeFile(file);
        
        setUploadedFiles(prev => 
          prev.map(uploadedFile => 
            uploadedFile.file === file 
              ? { ...uploadedFile, status: 'success', analysis }
              : uploadedFile
          )
        );

        // Call callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(file.name, analysis);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        
        setUploadedFiles(prev => 
          prev.map(uploadedFile => 
            uploadedFile.file === file 
              ? { ...uploadedFile, status: 'error', error: errorMessage }
              : uploadedFile
          )
        );
      }
    }
  }, [onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const clearFiles = () => {
    setUploadedFiles([]);
  };

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
            : 'border-champagne hover:border-blush hover:bg-blush/5'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <Upload 
            className={`w-12 h-12 ${
              isDragActive ? 'text-blush' : 'text-champagne'
            }`} 
          />
          
          {isDragActive ? (
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
                Accepts PDF, Excel (.xlsx, .xls), and CSV files up to 10MB
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
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <File className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      
                      {uploadedFile.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-blush animate-spin" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Status Messages */}
                    {uploadedFile.status === 'uploading' && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-blush">
                          <div className="w-2 h-2 bg-blush rounded-full animate-pulse"></div>
                          Analyzing document...
                        </div>
                      </div>
                    )}

                    {uploadedFile.status === 'error' && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                          {uploadedFile.error}
                        </p>
                      </div>
                    )}

                    {/* AI Analysis */}
                    {uploadedFile.status === 'success' && uploadedFile.analysis && (
                      <div className="bg-soft-gold/10 border border-soft-gold/20 rounded-md p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          AI Analysis Summary
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {uploadedFile.analysis}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}