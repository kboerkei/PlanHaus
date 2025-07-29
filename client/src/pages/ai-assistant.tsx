import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Sparkles, Calendar, DollarSign, Users, RotateCcw, Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";

// Enhanced interface for chat messages with additional properties
interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  isTyping?: boolean;
  isError?: boolean;
  isFileAnalysis?: boolean;
  fileName?: string;
}

// Interface for uploaded files with analysis
interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  analysis?: string;
  error?: string;
}

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuickAction, setLastQuickAction] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Mock intake form summary - in a real app, this would come from the intake data
  // This provides context to the AI for more personalized responses
  const formSummary = "We're planning a romantic garden wedding in Austin with 150 guests and a $40,000 budget. Our top priorities are food, vibe, and guest experience. The ceremony will be at Sunset Ranch Austin in October 2025, with a rustic farmhouse theme featuring blush pink and navy blue colors.";
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm your AI wedding planning assistant. I can help you with timeline creation, budget planning, vendor suggestions, and more. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);

  const handleQuickAction = (actionMessage: string, isFileUpload: boolean = false) => {
    // Handle file upload action differently
    if (isFileUpload) {
      setShowFileUpload(!showFileUpload);
      return;
    }
    
    // Prevent double-click spamming - check if this is the same as last quick action
    if (lastQuickAction === actionMessage || isLoading) {
      return;
    }
    
    setLastQuickAction(actionMessage);
    setMessage(actionMessage);
    
    // Auto-send the message after a brief delay to show it was populated
    setTimeout(() => {
      if (actionMessage.trim() && !isLoading) {
        handleSendMessage();
      }
    }, 100);
    
    // Reset the last quick action after a delay to allow the same action again later
    setTimeout(() => {
      setLastQuickAction(null);
    }, 2000);
  };

  // File analysis function
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

  // Handle file drops
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
      
      // Add user message for file upload
      setChatHistory(prev => [...prev, {
        id: Date.now() + i,
        type: 'user' as const,
        message: `📎 Uploaded: ${file.name}`,
        timestamp: new Date(),
        fileName: file.name
      }]);
      
      try {
        const analysis = await analyzeFile(file);
        
        setUploadedFiles(prev => 
          prev.map(uploadedFile => 
            uploadedFile.file === file 
              ? { ...uploadedFile, status: 'success', analysis }
              : uploadedFile
          )
        );

        // Add AI response with analysis
        setChatHistory(prev => [...prev, {
          id: Date.now() + i + 1000,
          type: 'ai' as const,
          message: analysis,
          timestamp: new Date(),
          isFileAnalysis: true,
          fileName: file.name
        }]);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        
        setUploadedFiles(prev => 
          prev.map(uploadedFile => 
            uploadedFile.file === file 
              ? { ...uploadedFile, status: 'error', error: errorMessage }
              : uploadedFile
          )
        );

        // Add error message to chat
        setChatHistory(prev => [...prev, {
          id: Date.now() + i + 2000,
          type: 'ai' as const,
          message: `Sorry, I couldn't analyze ${file.name}. ${errorMessage}`,
          timestamp: new Date(),
          isError: true
        }]);
      }
    }
  }, []);

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
    noClick: !showFileUpload,
    noDrag: !showFileUpload,
  });

  const quickActions = [
    {
      icon: Calendar,
      title: "Generate Timeline",
      description: "Create a custom wedding planning timeline",
      message: "Can you help me create a detailed wedding planning timeline? My wedding is in 6 months and I need to know what to do when.",
      isFileUpload: false
    },
    {
      icon: DollarSign,
      title: "Budget Breakdown",
      description: "Get a detailed budget analysis",
      message: "I need help creating a realistic budget breakdown for my wedding. My total budget is around $50,000.",
      isFileUpload: false
    },
    {
      icon: Users,
      title: "Vendor Suggestions",
      description: "Find recommended vendors in your area",
      message: "Can you help me find wedding vendors in Austin, Texas? I need recommendations for photographers, caterers, and florists with good reviews and reasonable pricing.",
      isFileUpload: false
    },
    {
      icon: Sparkles,
      title: "Style Inspiration",
      description: "Get personalized theme and style ideas",
      message: "I'm looking for wedding theme and style inspiration. I love garden parties and romantic, elegant vibes.",
      isFileUpload: false
    },
    {
      icon: Upload,
      title: "Analyze Documents",
      description: "Upload contracts, budgets, or planning files",
      message: "",
      isFileUpload: true
    }
  ];

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);
    
    // Add user message using callback to ensure correct ID
    setChatHistory(prev => {
      const userMessage = {
        id: Date.now(), // Use timestamp for unique ID
        type: 'user' as const,
        message: currentMessage,
        timestamp: new Date()
      };
      return [...prev, userMessage];
    });
    
    // Show typing indicator immediately
    const typingId = Date.now() + 0.5;
    setChatHistory(prev => [...prev, {
      id: typingId,
      type: 'ai' as const,
      message: 'typing...',
      timestamp: new Date(),
      isTyping: true
    }]);
    
    try {
      // Inject intake form context for more personalized responses
      // For follow-up question detection, we could analyze the conversation history:
      // - Check if current message references previous responses ("that venue", "those suggestions")
      // - Look for pronouns and context clues that indicate continuation
      // - Pass recent chat history (last 3-5 messages) to maintain conversation context
      // This would enable the AI to provide more contextual and coherent responses
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({ 
          message: currentMessage,
          context: 'wedding_planning_assistant'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Remove typing indicator and add real AI response
      setChatHistory(prev => {
        const filteredHistory = prev.filter(msg => msg.id !== typingId);
        const aiResponse = {
          id: Date.now() + 1, // Use timestamp + 1 for unique ID
          type: 'ai' as const,
          message: data.response || "I'm here to help with your wedding planning! Could you tell me more about what you'd like assistance with?",
          timestamp: new Date()
        };
        return [...filteredHistory, aiResponse];
      });
    } catch (error) {

      // Remove typing indicator and show error message
      setChatHistory(prev => {
        const filteredHistory = prev.filter(msg => msg.id !== typingId);
        const errorResponse = {
          id: Date.now() + 1,
          type: 'ai' as const,
          message: "Oops! Something went wrong. Please try again in a moment.",
          timestamp: new Date(),
          isError: true
        };
        return [...filteredHistory, errorResponse];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Retry function for failed messages
  const handleRetry = () => {
    // Remove the last error message and retry with the previous user message
    setChatHistory(prev => {
      const lastErrorIndex = prev.findLastIndex(msg => msg.isError);
      if (lastErrorIndex > 0) {
        const lastUserMessage = prev[lastErrorIndex - 1];
        if (lastUserMessage.type === 'user') {
          setMessage(lastUserMessage.message);
          return prev.slice(0, lastErrorIndex);
        }
      }
      return prev;
    });
  };

  return (
    <div className="p-3 sm:p-6 mobile-safe-spacing">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-800 mb-2">
                AI Wedding Assistant
              </h1>
              <p className="text-gray-600">
                Get personalized recommendations and automated planning assistance
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card 
                    key={index} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      action.isFileUpload && showFileUpload ? 'ring-2 ring-rose-300 bg-rose-50' : ''
                    }`} 
                    onClick={() => handleQuickAction(action.message, action.isFileUpload)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-blush-rose rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="text-white" size={16} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{action.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-tight">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="text-blush" size={24} />
                  <span>Chat with AI Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-96 overflow-y-auto mb-4 space-y-4 border rounded-lg p-3 sm:p-4 bg-gray-50">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                        chat.type === 'user' 
                          ? 'bg-blush text-white' 
                          : chat.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : chat.isTyping
                          ? 'bg-gray-100 text-gray-600 border border-gray-200'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        {/* Show typing animation or regular message */}
                        {chat.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">AI is typing</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* File analysis indicator */}
                            {chat.isFileAnalysis && (
                              <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                                <FileText size={14} />
                                <span>Analysis of: {chat.fileName}</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              {/* Enhanced timestamp formatting */}
                              <p className={`text-xs opacity-70 ${
                                chat.type === 'user' ? 'text-white text-opacity-70' : 'text-gray-500'
                              }`}>
                                {chat.timestamp.toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </p>
                              {/* Retry button for error messages */}
                              {chat.isError && (
                                <Button
                                  onClick={handleRetry}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 py-0 text-xs text-red-600 hover:text-red-800"
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Retry
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={chatEndRef} />
                </div>
                
                {/* File Upload Dropzone - shown when file upload is active */}
                {showFileUpload && (
                  <div className="mb-4">
                    <div
                      {...getRootProps()}
                      className={`
                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
                        ${isDragActive && !isDragReject 
                          ? 'border-rose-400 bg-rose-50 scale-[1.02]' 
                          : isDragReject 
                          ? 'border-red-400 bg-red-50' 
                          : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50'
                        }
                      `}
                    >
                      <input {...getInputProps()} />
                      
                      <div className="flex flex-col items-center gap-3">
                        <Upload 
                          className={`w-8 h-8 ${
                            isDragActive && !isDragReject 
                              ? 'text-rose-500' 
                              : isDragReject 
                              ? 'text-red-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                        
                        {isDragReject ? (
                          <div className="text-center">
                            <p className="text-red-600 font-medium">Invalid file type</p>
                            <p className="text-sm text-red-500">Only PDF, Excel, and CSV files are supported</p>
                          </div>
                        ) : isDragActive ? (
                          <p className="text-rose-600 font-medium">Drop your wedding documents here</p>
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-700 font-medium">Drop wedding documents here</p>
                            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
                            <p className="text-xs text-gray-400 mt-2">Supports PDF, Excel (.xlsx, .xls), and CSV files up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Close file upload */}
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFileUpload(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} className="mr-1" />
                        Close
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about your wedding planning..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="gradient-blush-rose text-white disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
