import { Users, MessageCircle, Activity, Share2, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function CollaborativeFeatures() {
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const { data: collaborators } = useQuery({
    queryKey: ['/api/projects', projects?.[0]?.id, 'collaborators'],
    enabled: !!projects?.[0]?.id
  });

  const { data: activities } = useQuery({
    queryKey: ['/api/projects', projects?.[0]?.id, 'activities'],
    enabled: !!projects?.[0]?.id
  });

  const project = projects?.[0];
  const recentActivities = activities?.slice(0, 3) || [];
  const activeCollaborators = collaborators?.filter(c => c.status === 'active') || [];

  if (!project) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="text-purple-600" size={20} />
          <span>Team Collaboration</span>
          {activeCollaborators.length > 0 && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {activeCollaborators.length + 1} members
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Collaborators */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
              <Users size={16} />
              <span>Team Members</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">You</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Project Owner</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Online now</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Owner</Badge>
              </div>
              
              {activeCollaborators.slice(0, 2).map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {collaborator.user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{collaborator.user.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{collaborator.role}</p>
                  </div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              ))}
              
              {activeCollaborators.length > 2 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">
                    +{activeCollaborators.length - 2} more members
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
              <Activity size={16} />
              <span>Recent Activity</span>
            </h4>
            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity size={12} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.user.name}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>
                        {activity.details?.taskTitle && (
                          <span className="font-medium"> "{activity.details.taskTitle}"</span>
                        )}
                        {activity.details?.guestName && (
                          <span className="font-medium"> {activity.details.guestName}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400">Get started to see updates here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
          <Button size="sm" variant="outline" className="flex items-center space-x-2">
            <Share2 size={16} />
            <span>Invite Members</span>
          </Button>
          <Button size="sm" variant="outline" className="flex items-center space-x-2">
            <Bell size={16} />
            <span>Notifications</span>
          </Button>
          <Link href="/timeline">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              View All Activity
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}