import { useState, memo, useCallback } from "react";
import { OptimizedFileDropzone } from "../components/enhanced/OptimizedFileDropzone";
import { useToast } from '@/hooks/use-toast';
import { sanitizeText } from "../utils/sanitize";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

const ChatComponent = memo(() => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm PlanBot. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);



  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const sanitizedInput = sanitizeText(input);
    const newMessages = [...messages, { sender: "user", text: sanitizedInput }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: sanitizedInput }),
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('sessionId')}`
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const { response } = await res.json();

      setMessages([
        ...newMessages,
        { sender: "ai", text: response },
      ]);

      toast({
        title: 'Message sent',
        description: 'AI response received'
      });

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setMessages([
        ...newMessages,
        { sender: "ai", text: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);

      toast({
        title: 'Message failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
    
    setLoading(false);
  }, [input, messages, toast]);

  const handleAnalysisComplete = useCallback((fileName: string, analysis: string) => {
    const sanitizedFileName = sanitizeText(fileName);
    const sanitizedAnalysis = sanitizeText(analysis);
    
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `📄 Analyzed: ${sanitizedFileName}` },
      { sender: "ai", text: sanitizedAnalysis }
    ]);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Chat Section */}
      <div className="bg-white rounded-xl shadow-md h-[50vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat with PlanBot</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg w-fit max-w-[75%] ${
                msg.sender === "ai"
                  ? "bg-soft-gold text-left"
                  : "bg-blush text-right self-end ml-auto"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && <p className="text-muted-foreground animate-pulse">PlanBot is typing...</p>}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
            />
            <button
              onClick={sendMessage}
              className="bg-champagne px-4 py-2 rounded text-white font-semibold hover:bg-champagne/90 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* File Analysis Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Analysis</h2>
        <p className="text-gray-600 mb-6">
          Upload wedding contracts, budgets, or planning documents for AI-powered analysis and recommendations.
        </p>
        
        <OptimizedFileDropzone onAnalysisComplete={handleAnalysisComplete} />
      </div>
    </div>
  );
});

ChatComponent.displayName = 'ChatComponent';

export default function Chat() {
  return (
    <ErrorBoundary>
      <ChatComponent />
    </ErrorBoundary>
  );
}