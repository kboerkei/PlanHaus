import { Sparkles, ChevronRight, Calendar, Users, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AINextStep {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "venue" | "catering" | "guests" | "planning" | "vendors"
  dueDate?: string
  estimatedTime?: string
}

interface AINextStepsPanelProps {
  daysToGo: number
  className?: string
}

export function AINextStepsPanel({ daysToGo, className }: AINextStepsPanelProps) {
  // AI-generated suggestions based on wedding timeline
  const getAISuggestions = (daysToGo: number): AINextStep[] => {
    if (daysToGo > 180) {
      return [
        {
          id: "1",
          title: "Book your florist soon!",
          description: "Popular vendors fill up 6 months ahead. Popular wedding vendors book up fast - secure your favorite florist now.",
          priority: "high",
          category: "vendors",
          estimatedTime: "2-3 hours"
        },
        {
          id: "2", 
          title: "Send invitations",
          description: "Give guests 6-8 weeks notice for planning. Include RSVP deadline and wedding website.",
          priority: "medium",
          category: "guests",
          dueDate: "8 weeks before"
        },
        {
          id: "3",
          title: "Final dress fitting",
          description: "Schedule your final alterations 2-3 weeks before the big day for perfect fit.",
          priority: "medium",
          category: "planning",
          dueDate: "2-3 weeks before"
        }
      ]
    } else if (daysToGo > 90) {
      return [
        {
          id: "4",
          title: "Finalize guest list",
          description: "Lock in your final headcount for catering and seating arrangements.",
          priority: "high",
          category: "guests",
          estimatedTime: "1-2 hours"
        },
        {
          id: "5",
          title: "Book transportation",
          description: "Arrange transport for the wedding party and guests if needed.",
          priority: "medium",
          category: "planning",
          estimatedTime: "30 minutes"
        }
      ]
    } else {
      return [
        {
          id: "6",
          title: "Confirm all vendors",
          description: "Call each vendor to confirm timing, details, and final headcount.",
          priority: "high",
          category: "vendors",
          estimatedTime: "2 hours",
          dueDate: "1 week before"
        },
        {
          id: "7",
          title: "Pack honeymoon bags",
          description: "Don't forget passports, chargers, and comfortable clothes for after the wedding!",
          priority: "medium", 
          category: "planning",
          estimatedTime: "1 hour"
        }
      ]
    }
  }

  const suggestions = getAISuggestions(daysToGo)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "venue": return MapPin
      case "guests": return Users  
      case "planning": return Calendar
      default: return ChevronRight
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium": return "bg-warning/10 text-warning border-warning/20"
      case "low": return "bg-success/10 text-success border-success/20"
      default: return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  return (
    <Card variant="glass" className={`${className} animate-fade-in-up`} style={{ animationDelay: "200ms" }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-serif">AI Suggestions</span>
          <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
            Smart Planning
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Based on your timeline and progress, here are personalized recommendations:
        </p>
        
        {suggestions.map((suggestion, index) => {
          const CategoryIcon = getCategoryIcon(suggestion.category)
          
          return (
            <div 
              key={suggestion.id} 
              className="group flex items-start space-x-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-background/50 hover:bg-background/80 transition-all duration-200 cursor-pointer"
              data-testid={`ai-suggestion-${index}`}
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-accent/10">
                <CategoryIcon className="h-4 w-4 text-accent-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </h4>
                  <Badge 
                    variant="outline" 
                    className={`${getPriorityColor(suggestion.priority)} text-xs flex-shrink-0`}
                  >
                    {suggestion.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                  {suggestion.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    {suggestion.dueDate && (
                      <span>📅 {suggestion.dueDate}</span>
                    )}
                    {suggestion.estimatedTime && (
                      <span>⏱️ {suggestion.estimatedTime}</span>
                    )}
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          )
        })}
        
        <div className="pt-2 border-t border-border/50">
          <Button 
            variant="outline" 
            className="w-full justify-center"
            data-testid="view-all-suggestions"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            View All AI Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}