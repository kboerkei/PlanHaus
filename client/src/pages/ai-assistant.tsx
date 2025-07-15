import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Sparkles, Calendar, DollarSign, Users, RotateCcw } from "lucide-react";

// Enhanced interface for chat messages with additional properties
interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  isTyping?: boolean;
  isError?: boolean;
}

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuickAction, setLastQuickAction] = useState<string | null>(null);
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

  const handleQuickAction = (actionMessage: string) => {
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

  const quickActions = [
    {
      icon: Calendar,
      title: "Generate Timeline",
      description: "Create a custom wedding planning timeline",
      message: "Can you help me create a detailed wedding planning timeline? My wedding is in 6 months and I need to know what to do when."
    },
    {
      icon: DollarSign,
      title: "Budget Breakdown",
      description: "Get a detailed budget analysis",
      message: "I need help creating a realistic budget breakdown for my wedding. My total budget is around $50,000."
    },
    {
      icon: Users,
      title: "Vendor Suggestions",
      description: "Find recommended vendors in your area",
      message: "Can you suggest reliable wedding vendors in my area? I need a photographer, florist, and caterer."
    },
    {
      icon: Sparkles,
      title: "Style Inspiration",
      description: "Get personalized theme and style ideas",
      message: "I'm looking for wedding theme and style inspiration. I love garden parties and romantic, elegant vibes."
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
          context: 'wedding_planning_assistant',
          summary: formSummary, // Include wedding context from intake form
          // Future enhancement: include recent conversation history for better context
          // conversationHistory: chatHistory.slice(-6).map(msg => ({ type: msg.type, message: msg.message }))
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
      console.error('Chat error:', error);
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
    <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                AI Wedding Assistant
              </h1>
              <p className="text-gray-600">
                Get personalized recommendations and automated planning assistance
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickAction(action.message)}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 gradient-blush-rose rounded-lg flex items-center justify-center">
                          <Icon className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
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
                <div className="h-96 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4 bg-gray-50">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
