import { Calendar, Users, DollarSign, CheckCircle2, Clock, TrendingUp, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import { motion } from "framer-motion"

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

  const formatCurrency = (amount: number | string) => {
    // Handle string inputs and ensure proper number parsing
    let safeAmount = 0;
    
    if (typeof amount === 'string') {
      // Remove any non-numeric characters except decimal points
      const cleanString = amount.replace(/[^0-9.]/g, '');
      safeAmount = parseFloat(cleanString) || 0;
    } else if (typeof amount === 'number') {
      safeAmount = amount;
    } else {
      safeAmount = 0;
    }
    
    // Ensure the amount is a valid number
    if (isNaN(safeAmount) || !isFinite(safeAmount)) {
      safeAmount = 0;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(safeAmount)
  }

  const stats = [
    {
      href: "/timeline",
      icon: Calendar,
      label: "Days to Go",
      value: daysToGo.toString(),
      trend: daysToGo < 30 ? "urgent" : daysToGo < 90 ? "warning" : "normal",
      color: daysToGo < 30 ? "text-red-600" : daysToGo < 90 ? "text-yellow-600" : "text-blue-600",
      bgColor: daysToGo < 30 ? "bg-red-50" : daysToGo < 90 ? "bg-yellow-50" : "bg-blue-50",
      gradient: daysToGo < 30 ? "from-red-400 to-red-600" : daysToGo < 90 ? "from-yellow-400 to-yellow-600" : "from-blue-400 to-blue-600",
      emoji: daysToGo < 30 ? "🚨" : daysToGo < 90 ? "⏰" : "📅",
      description: "Until your special day"
    },
    {
      href: "/guests",
      icon: Users,
      label: "Guest Confirmations",
      value: `${confirmedGuests}/${totalGuests}`,
      progress: guestConfirmRate,
      trend: guestConfirmRate > 75 ? "good" : guestConfirmRate > 50 ? "normal" : "needs-attention",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-400 to-purple-600",
      emoji: "👥",
      description: "RSVP responses received"
    },
    {
      href: "/budget",
      icon: DollarSign,
      label: "Budget Progress",
      value: `${formatCurrency(spentBudget)}`,
      subtitle: `of ${formatCurrency(totalBudget)}`,
      progress: Math.min(budgetUsageRate, 100),
      trend: budgetUsageRate < 85 ? "good" : budgetUsageRate < 95 ? "warning" : "urgent",
      color: budgetUsageRate < 85 ? "text-green-600" : budgetUsageRate < 95 ? "text-yellow-600" : "text-red-600",
      bgColor: budgetUsageRate < 85 ? "bg-green-50" : budgetUsageRate < 95 ? "bg-yellow-50" : "bg-red-50",
      gradient: budgetUsageRate < 85 ? "from-green-400 to-green-600" : budgetUsageRate < 95 ? "from-yellow-400 to-yellow-600" : "from-red-400 to-red-600",
      emoji: "💰",
      description: "Budget utilization"
    },
    {
      href: "/timeline",
      icon: CheckCircle2,
      label: "Tasks Complete",
      value: `${completedTasks}/${totalTasks}`,
      progress: taskCompletionRate,
      trend: taskCompletionRate > 75 ? "good" : taskCompletionRate > 50 ? "normal" : "needs-attention",
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-400 to-green-600",
      emoji: "✅",
      description: "Planning progress"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Link key={index} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                          {stat.label}
                        </p>
                        <p className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{stat.emoji}</span>
                      {stat.trend === "good" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100 transition-colors">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          On Track
                        </Badge>
                      )}
                      {stat.trend === "warning" && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 group-hover:bg-yellow-100 transition-colors">
                          <Clock className="h-3 w-3 mr-1" />
                          Monitor
                        </Badge>
                      )}
                      {stat.trend === "urgent" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 transition-colors">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                      {stat.trend === "needs-attention" && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 group-hover:bg-orange-100 transition-colors">
                          <Clock className="h-3 w-3 mr-1" />
                          Needs Attention
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold font-serif text-gray-900 group-hover:text-gray-800 transition-colors">
                        {stat.value}
                      </div>
                      {stat.subtitle && (
                        <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">{stat.subtitle}</span>
                      )}
                    </div>
                    {stat.progress !== undefined && (
                      <div className="space-y-2">
                        <Progress 
                          value={stat.progress} 
                          className="progress-wedding h-2 group-hover:h-3 transition-all duration-300"
                          data-testid={`progress-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                            {stat.progress.toFixed(0)}% complete
                          </p>
                          <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    )}
                    {stat.progress === undefined && (
                      <div className="flex items-center justify-end">
                        <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}