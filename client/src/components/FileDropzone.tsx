import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
                  <div className="flex-shrink-0">
                    {uploadedFile.status === 'uploading' && <Loader2 className="w-5 h-5 text-champagne animate-spin" />}
                    {uploadedFile.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {uploadedFile.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {uploadedFile.status === 'uploading' && (
                      <p className="text-sm text-champagne">Analyzing...</p>
                    )}

                    {uploadedFile.status === 'error' && (
                      <p className="text-sm text-red-600">{uploadedFile.error}</p>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}