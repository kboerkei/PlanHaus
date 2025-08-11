import { Calendar, Users, DollarSign, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface QuickStatsBarProps {
  totalGuests: number
  confirmedGuests: number
  totalBudget: number
  spentBudget: number
  completedTasks: number
  totalTasks: number
  daysToGo: number
}

export function QuickStatsBar({
  totalGuests,
  confirmedGuests,
  totalBudget,
  spentBudget,
  completedTasks,
  totalTasks,
  daysToGo
}: QuickStatsBarProps) {
  const guestConfirmRate = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0
  const budgetUsageRate = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      icon: Calendar,
      label: "Days to Go",
      value: daysToGo.toString(),
      trend: daysToGo < 30 ? "urgent" : daysToGo < 90 ? "warning" : "normal",
      color: daysToGo < 30 ? "text-destructive" : daysToGo < 90 ? "text-warning" : "text-primary",
    },
    {
      icon: Users,
      label: "Guest Confirmations",
      value: `${confirmedGuests}/${totalGuests}`,
      progress: guestConfirmRate,
      trend: guestConfirmRate > 75 ? "good" : guestConfirmRate > 50 ? "normal" : "needs-attention",
      color: "text-primary",
    },
    {
      icon: DollarSign,
      label: "Budget Progress",
      value: `${formatCurrency(spentBudget)}`,
      subtitle: `of ${formatCurrency(totalBudget)}`,
      progress: Math.min(budgetUsageRate, 100),
      trend: budgetUsageRate < 85 ? "good" : budgetUsageRate < 95 ? "warning" : "urgent",
      color: budgetUsageRate < 85 ? "text-success" : budgetUsageRate < 95 ? "text-warning" : "text-destructive",
    },
    {
      icon: CheckCircle2,
      label: "Tasks Complete",
      value: `${completedTasks}/${totalTasks}`,
      progress: taskCompletionRate,
      trend: taskCompletionRate > 75 ? "good" : taskCompletionRate > 50 ? "normal" : "needs-attention",
      color: "text-success",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} variant="elevated" className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
                {stat.trend === "good" && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    On Track
                  </Badge>
                )}
                {stat.trend === "warning" && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    <Clock className="h-3 w-3 mr-1" />
                    Monitor
                  </Badge>
                )}
                {stat.trend === "urgent" && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    <Clock className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold font-serif">{stat.value}</div>
                  {stat.subtitle && (
                    <span className="text-xs text-muted-foreground">{stat.subtitle}</span>
                  )}
                </div>
                {stat.progress !== undefined && (
                  <div className="space-y-1">
                    <Progress 
                      value={stat.progress} 
                      className="progress-wedding h-2"
                      data-testid={`progress-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {stat.progress.toFixed(0)}% complete
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}