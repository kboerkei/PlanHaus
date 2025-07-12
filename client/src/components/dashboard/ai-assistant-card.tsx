import { Bot, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIAssistantCard() {
  return (
    <div className="lg:col-span-2">
      <div className="gradient-blush-rose rounded-2xl shadow-sm p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold">AI Planning Assistant</h3>
            <p className="text-white text-opacity-90">Get personalized recommendations</p>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-4">
          <p className="text-white text-opacity-95 mb-3">
            "Based on your garden party theme and spring timeline, I recommend booking your florist this week. Peony season pricing increases 30% after March."
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <Star key={i} className="text-yellow-300" size={14} fill="currentColor" />
              ))}
            </div>
            <span className="text-white text-opacity-75 text-sm">3 vendor suggestions ready</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-white text-rose-gold font-semibold hover:bg-gray-50 border-0"
          size="lg"
        >
          Chat with AI Assistant
        </Button>
      </div>
    </div>
  );
}
