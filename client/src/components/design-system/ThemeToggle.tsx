import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "minimal" | "floating";
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className, 
  variant = "default", 
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const variantStyles = {
    default: "h-9 w-9",
    minimal: "h-8 w-8 hover:bg-accent/50",
    floating: "h-10 w-10 shadow-lg hover:shadow-xl",
  };

  if (showLabel) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className={cn("gap-2", className)}
      >
        {theme === "light" ? (
          <>
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Dark</span>
          </>
        ) : (
          <>
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Light</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        variantStyles[variant],
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Sun icon */}
      <Sun 
        className={cn(
          "h-4 w-4 transition-all duration-300",
          theme === "light" 
            ? "rotate-0 scale-100" 
            : "-rotate-90 scale-0"
        )} 
      />
      
      {/* Moon icon */}
      <Moon 
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          theme === "light" 
            ? "rotate-90 scale-0" 
            : "rotate-0 scale-100"
        )} 
      />
    </Button>
  );
}

export default ThemeToggle;