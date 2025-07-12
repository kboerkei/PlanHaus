import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
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

  const quickActions = [
    {
      icon: Calendar,
      title: "Generate Timeline",
      description: "Create a custom wedding planning timeline",
      action: () => {}
    },
    {
      icon: DollarSign,
      title: "Budget Breakdown",
      description: "Get a detailed budget analysis",
      action: () => {}
    },
    {
      icon: Users,
      title: "Vendor Suggestions",
      description: "Find recommended vendors in your area",
      action: () => {}
    },
    {
      icon: Sparkles,
      title: "Style Inspiration",
      description: "Get personalized theme and style ideas",
      action: () => {}
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = {
      id: chatHistory.length + 1,
      type: 'user',
      message: message,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: chatHistory.length + 2,
        type: 'ai',
        message: "I understand you need help with that. Let me analyze your wedding details and provide personalized recommendations. This is a demo response - in the full version, I would provide detailed, AI-generated suggestions based on your specific needs.",
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
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
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
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
                <div className="h-96 overflow-y-auto mb-4 space-y-4">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        chat.type === 'user' 
                          ? 'bg-blush text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{chat.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {chat.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about your wedding planning..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="gradient-blush-rose text-white">
                    <Send size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
