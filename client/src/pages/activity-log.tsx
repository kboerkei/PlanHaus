import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Clock, 
  User, 
  Calendar, 
  Filter, 
  Sparkles,
  Edit,
  Plus,
  Trash2,
  Users,
  DollarSign,
  MapPin,
  Camera,
  Palette,
  CheckSquare
} from 'lucide-react';
import { RoleBasedAccess } from '@/components/RoleBasedAccess';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

interface ActivityLogEntry {
  id: number;
  projectId: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

const sectionIcons = {
  'Creative Details': Palette,
  'Budget': DollarSign,
  'Guest List': Users,
  'Vendors': MapPin,
  'Timeline': Calendar,
  'Inspiration': Camera,
  'Tasks': CheckSquare,
  'Schedule': Clock
};

const actionColors = {
  'created': 'bg-green-100 text-green-800 border-green-200',
  'updated': 'bg-blue-100 text-blue-800 border-blue-200',
  'deleted': 'bg-red-100 text-red-800 border-red-200',
  'completed': 'bg-purple-100 text-purple-800 border-purple-200'
};

export default function ActivityLogPage() {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch activity log
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-log', 1, selectedUser, selectedSection],
    queryFn: async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return [];

      const params = new URLSearchParams({
        projectId: '1',
        limit: '50'
      });
      
      if (selectedUser !== 'all') {
        params.append('userId', selectedUser);
      }
      
      if (selectedSection !== 'all') {
        params.append('section', selectedSection);
      }

      const response = await fetch(`/api/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }
      
      return response.json();
    },
  });

  // Fetch unique users from activities for filter
  const uniqueUsers = activities.reduce((users: any[], activity: ActivityLogEntry) => {
    if (!users.find(user => user.id === activity.user.id)) {
      users.push(activity.user);
    }
    return users;
  }, []);

  // Generate AI summary
  const generateAISummary = async () => {
    setIsGeneratingAISummary(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          message: `Please summarize this week's wedding planning activity in a friendly, conversational tone. Focus on what was accomplished and by whom. Recent activities: ${activities.slice(0, 10).map(a => `${a.user.username} ${a.action} ${a.entityType} - ${a.details}`).join(', ')}`
        }),
      });

      if (response.ok) {
        const { response: summary } = await response.json();
        setAiSummary(summary);
        toast({
          title: 'AI Summary Generated!',
          description: 'Your weekly activity summary is ready.',
        });
      } else {
        throw new Error('Failed to generate summary');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate AI summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  const getSectionIcon = (entityType: string) => {
    const Icon = sectionIcons[entityType as keyof typeof sectionIcons] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    return actionColors[action.toLowerCase() as keyof typeof actionColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blush"></div>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedAccess requiredRole="Collaborator">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-serif">Activity Log</h1>
            <p className="text-gray-600 mt-2">Track all changes made to your wedding plans</p>
          </div>
          
          <Button 
            onClick={generateAISummary}
            disabled={isGeneratingAISummary}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGeneratingAISummary ? 'Generating...' : 'AI Weekly Summary'}
          </Button>
        </div>

        {/* AI Summary Card */}
        {aiSummary && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Sparkles className="w-5 h-5 mr-2" />
                This Week's Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 leading-relaxed">{aiSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="w-5 h-5 mr-2" />
              Filter Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Team Member</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="All team members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All team members</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sections</SelectItem>
                    <SelectItem value="Creative Details">Creative Details</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                    <SelectItem value="Guest List">Guest List</SelectItem>
                    <SelectItem value="Vendors">Vendors</SelectItem>
                    <SelectItem value="Timeline">Timeline</SelectItem>
                    <SelectItem value="Tasks">Tasks</SelectItem>
                    <SelectItem value="Inspiration">Inspiration</SelectItem>
                    <SelectItem value="Schedule">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600 text-center">
                  When you and your team make changes to your wedding plans, they'll appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            activities.map((activity: ActivityLogEntry) => (
              <Card key={activity.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blush/20 to-rose-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {getSectionIcon(activity.entityType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {activity.user.username}
                          </h4>
                          <Badge className={`${getActionColor(activity.action)} text-xs font-medium`}>
                            {activity.action}
                          </Badge>
                          <span className="text-sm text-gray-500">{activity.entityType}</span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">
                          {activity.details}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Statistics</CardTitle>
            <CardDescription>Overview of team activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blush">
                  {activities.length}
                </div>
                <div className="text-sm text-gray-600">Total Activities</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activities.filter(a => a.action.toLowerCase() === 'created').length}
                </div>
                <div className="text-sm text-gray-600">Items Created</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activities.filter(a => a.action.toLowerCase() === 'updated').length}
                </div>
                <div className="text-sm text-gray-600">Items Updated</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {uniqueUsers.length}
                </div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedAccess>
  );
}