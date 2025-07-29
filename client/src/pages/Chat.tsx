import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm PlanBot. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const sessionId = localStorage.getItem("sessionId");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
        body: formData,
      });

      const { message, fileUrl } = await res.json();
      alert(message || "File uploaded!");

      // Optionally add to message thread:
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `Uploaded file: ${file.name}` },
      ]);
    } catch (error) {
      alert("Upload failed. Please try again.");
      console.error("Upload error:", error);
    }
  };

  const handleFileAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const sessionId = localStorage.getItem("sessionId");
      setLoading(true);
      
      const res = await fetch("/api/analyzeFile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
        body: formData,
      });

      const { analysis, fileName } = await res.json();
      
      // Add analysis to chat
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `📄 Analyzed: ${fileName}` },
        { sender: "ai", text: analysis }
      ]);
    } catch (error) {
      alert("Analysis failed. Please try again.");
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ prompt: input }),
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('sessionId')}`
        },
      });
      const { response } = await res.json();

      setMessages([
        ...newMessages,
        { sender: "ai", text: response },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        { sender: "ai", text: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-xl shadow-md h-[80vh] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg w-fit max-w-[75%] ${
              msg.sender === "ai"
                ? "bg-soft-gold text-left"
                : "bg-blush text-right self-end"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p className="text-muted-foreground animate-pulse">PlanBot is typing...</p>}
      </div>
      <div className="mt-4 space-y-2">
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
            className="bg-champagne px-4 py-2 rounded text-white font-semibold"
          >
            Send
          </button>
        </div>
        <div className="flex justify-start gap-4">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-sm text-champagne underline"
          >
            Upload a file
          </label>
          
          <input
            type="file"
            onChange={handleFileAnalysis}
            className="hidden"
            id="file-analysis"
            accept=".pdf,.xlsx,.xls,.csv"
          />
          <label
            htmlFor="file-analysis"
            className="cursor-pointer text-sm text-champagne underline"
          >
            Analyze document
          </label>
        </div>
      </div>
    </div>
  );
}