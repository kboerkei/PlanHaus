import { useEffect, useState } from "react";
import { Command } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export default function KeyboardShortcuts() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    {
      key: "Ctrl+K",
      description: "Quick search",
      action: () => console.log("Search triggered")
    },
    {
      key: "Ctrl+N",
      description: "New task",
      action: () => window.location.href = "/timeline"
    },
    {
      key: "Ctrl+B",
      description: "Budget view", 
      action: () => window.location.href = "/budget"
    },
    {
      key: "Ctrl+G",
      description: "Guest list",
      action: () => window.location.href = "/guests"
    },
    {
      key: "Ctrl+V",
      description: "Vendors",
      action: () => window.location.href = "/vendors"
    },
    {
      key: "Ctrl+D",
      description: "Dashboard",
      action: () => window.location.href = "/"
    },
    {
      key: "Ctrl+?",
      description: "Show shortcuts",
      action: () => setIsHelpOpen(true)
    }
  ];

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const shortcut = shortcuts.find(s => {
          const key = s.key.split('+')[1].toLowerCase();
          return e.key.toLowerCase() === key || e.code === `Key${key.toUpperCase()}`;
        });
        
        if (shortcut) {
          e.preventDefault();
          shortcut.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Command size={20} />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <Badge variant="outline" className="font-mono text-xs">
                {shortcut.key}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}