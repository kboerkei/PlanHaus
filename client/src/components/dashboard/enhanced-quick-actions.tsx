import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Users, 
  Calendar, 
  DollarSign, 
  Building, 
  Camera,
  Music,
  Utensils,
  Car,
  AlertTriangle,
  UserPlus,
  CalendarPlus,
  PlusCircle,
  Target,
  MapPin,
  Heart,
  Flower,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EnhancedQuickActions() {
  const [, setLocation] = useLocation();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", category: "" });
  const [guestForm, setGuestForm] = useState({ name: "", email: "", group: "family" });
  const [budgetForm, setBudgetForm] = useState({ item: "", category: "venue", estimatedCost: "" });
  const { toast } = useToast();
  
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats']
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks']
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Task Created",
        description: "New wedding task added successfully",
      });
      setTaskForm({ title: "", description: "", priority: "medium", category: "" });
      setIsTaskDialogOpen(false);
    },
  });

  const createGuestMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/guests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Guest Added",
        description: "New guest added to your wedding list",
      });
      setGuestForm({ name: "", email: "", group: "family" });
      setIsGuestDialogOpen(false);
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/budget-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Budget Item Added",
        description: "New expense added to your wedding budget",
      });
      setBudgetForm({ item: "", category: "venue", estimatedCost: "" });
      setIsBudgetDialogOpen(false);
    },
  });

  // Calculate urgency and suggestions
  const getQuickActions = () => {
    const actions = [];
    
    // Essential wedding tasks
    const essentialActions = [
      {
        id: "add-task",
        title: "Add Wedding Task",
        description: "Create a new planning task",
        icon: <CalendarPlus className="h-5 w-5" />,
        color: "bg-blue-500 hover:bg-blue-600",
        category: "Planning",
        action: () => setIsTaskDialogOpen(true)
      },
      {
        id: "invite-guest",
        title: "Add Guest",
        description: "Add someone to your guest list",
        icon: <UserPlus className="h-5 w-5" />,
        color: "bg-green-500 hover:bg-green-600", 
        category: "Guests",
        action: () => setIsGuestDialogOpen(true)
      },
      {
        id: "track-expense",
        title: "Track Expense",
        description: "Add a budget item",
        icon: <PlusCircle className="h-5 w-5" />,
        color: "bg-purple-500 hover:bg-purple-600",
        category: "Budget",
        action: () => setIsBudgetDialogOpen(true)
      }
    ];

    // Navigation actions
    const navigationActions = [
      {
        id: "book-venue",
        title: "Find Venues",
        description: "Browse wedding venues",
        icon: <MapPin className="h-5 w-5" />,
        color: "bg-rose-500 hover:bg-rose-600",
        category: "Vendors",
        action: () => setLocation('/vendors')
      },
      {
        id: "plan-timeline", 
        title: "View Timeline",
        description: "See your wedding timeline",
        icon: <Calendar className="h-5 w-5" />,
        color: "bg-indigo-500 hover:bg-indigo-600",
        category: "Planning",
        action: () => setLocation('/timeline')
      },
      {
        id: "get-inspiration",
        title: "Get Inspired",
        description: "Browse wedding ideas",
        icon: <Heart className="h-5 w-5" />,
        color: "bg-pink-500 hover:bg-pink-600",
        category: "Inspiration",
        action: () => setLocation('/inspiration')
      }
    ];

    // Smart suggestions based on data
    if (dashboardStats) {
      if (dashboardStats.tasks?.overdue > 0) {
        actions.push({
          id: "overdue-tasks",
          title: `${dashboardStats.tasks.overdue} Overdue Tasks`,
          description: "Review overdue items",
          icon: <AlertTriangle className="h-5 w-5" />,
          color: "bg-red-500 hover:bg-red-600",
          category: "Urgent",
          urgent: true,
          action: () => setLocation('/timeline')
        });
      }

      if (dashboardStats.guests?.pending > 5) {
        actions.push({
          id: "pending-rsvps",
          title: "Follow Up RSVPs",
          description: `${dashboardStats.guests.pending} pending responses`,
          icon: <Users className="h-5 w-5" />,
          color: "bg-orange-500 hover:bg-orange-600",
          category: "Guests",
          urgent: true,
          action: () => setLocation('/guests')
        });
      }

      const budgetUsed = dashboardStats.budget ? (dashboardStats.budget.spent / dashboardStats.budget.total) * 100 : 0;
      if (budgetUsed > 80) {
        actions.push({
          id: "budget-warning",
          title: "Budget Alert",
          description: `${budgetUsed.toFixed(0)}% of budget used`,
          icon: <TrendingUp className="h-5 w-5" />,
          color: "bg-yellow-500 hover:bg-yellow-600",
          category: "Budget",
          urgent: true,
          action: () => setLocation('/budget')
        });
      }
    }

    return [...actions, ...essentialActions, ...navigationActions];
  };

  const quickActions = getQuickActions();

  return (
    <>
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center space-x-2">
            <Target className="h-5 w-5 text-blush" />
            <span>Smart Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Urgent Actions First */}
          {quickActions.filter(action => action.urgent).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600 flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Needs Attention</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.filter(action => action.urgent).map((action) => (
                  <Button
                    key={action.id}
                    onClick={action.action}
                    className={`${action.color} text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 justify-start h-auto p-3`}
                    variant="default"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      {action.icon}
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Regular Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 flex items-center space-x-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Quick Actions</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.filter(action => !action.urgent).slice(0, 6).map((action) => (
                <Button
                  key={action.id}
                  onClick={action.action}
                  className={`${action.color} text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 justify-start h-auto p-3`}
                  variant="default"
                >
                  <div className="flex items-center space-x-3 w-full">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Wedding Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="e.g., Book wedding photographer"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Add details about this task..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={taskForm.category} onValueChange={(value) => setTaskForm({ ...taskForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Venue">Venue</SelectItem>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Flowers">Flowers</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Attire">Attire</SelectItem>
                    <SelectItem value="Invitations">Invitations</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createTaskMutation.mutate(taskForm)}
              disabled={!taskForm.title || createTaskMutation.isPending}
              className="gradient-blush-rose text-white"
            >
              {createTaskMutation.isPending ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Guest Dialog */}
      <Dialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Guest Name</Label>
              <Input
                id="guest-name"
                placeholder="e.g., Sarah Johnson"
                value={guestForm.name}
                onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-email">Email (Optional)</Label>
              <Input
                id="guest-email"
                type="email"
                placeholder="sarah@example.com"
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Guest Group</Label>
              <Select value={guestForm.group} onValueChange={(value) => setGuestForm({ ...guestForm, group: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="colleagues">Colleagues</SelectItem>
                  <SelectItem value="wedding-party">Wedding Party</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGuestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createGuestMutation.mutate(guestForm)}
              disabled={!guestForm.name || createGuestMutation.isPending}
              className="gradient-blush-rose text-white"
            >
              {createGuestMutation.isPending ? "Adding..." : "Add Guest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Budget Dialog */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget-item">Item Name</Label>
              <Input
                id="budget-item"
                placeholder="e.g., Wedding venue deposit"
                value={budgetForm.item}
                onChange={(e) => setBudgetForm({ ...budgetForm, item: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-cost">Estimated Cost</Label>
              <Input
                id="budget-cost"
                type="number"
                placeholder="2500.00"
                value={budgetForm.estimatedCost}
                onChange={(e) => setBudgetForm({ ...budgetForm, estimatedCost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="music">Music & Entertainment</SelectItem>
                  <SelectItem value="flowers">Flowers & Decorations</SelectItem>
                  <SelectItem value="attire">Attire</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createBudgetMutation.mutate(budgetForm)}
              disabled={!budgetForm.item || !budgetForm.estimatedCost || createBudgetMutation.isPending}
              className="gradient-blush-rose text-white"
            >
              {createBudgetMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}