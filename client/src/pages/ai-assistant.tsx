import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Sparkles, Calendar, DollarSign, Users } from "lucide-react";

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm your AI wedding planning assistant. I can help you with timeline creation, budget planning, vendor suggestions, and more. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);

  const handleQuickAction = (actionMessage: string) => {
    setMessage(actionMessage);
    // Auto-send the message after a brief delay to show it was populated
    setTimeout(() => {
      if (actionMessage.trim() && !isLoading) {
        handleSendMessage();
      }
    }, 100);
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

  const [isLoading, setIsLoading] = useState(false);

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
    
    try {
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
      
      // Add AI response using callback to ensure correct state
      setChatHistory(prev => {
        const aiResponse = {
          id: Date.now() + 1, // Use timestamp + 1 for unique ID
          type: 'ai' as const,
          message: data.response || "I'm here to help with your wedding planning! Could you tell me more about what you'd like assistance with?",
          timestamp: new Date()
        };
        return [...prev, aiResponse];
      });
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => {
        const errorResponse = {
          id: Date.now() + 1,
          type: 'ai' as const,
          message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date()
        };
        return [...prev, errorResponse];
      });
    } finally {
      setIsLoading(false);
    }
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
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
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
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {chat.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
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
