import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Mail, Shield, Trash2, Crown, Edit } from 'lucide-react';
import { Collaborator } from '@/lib/supabase-creative-details';

interface InviteCollaboratorData {
  email: string;
  role: 'Owner' | 'Planner' | 'Collaborator' | 'Viewer';
}

export default function CollaboratorsPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Planner' | 'Collaborator' | 'Viewer'>('Collaborator');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch collaborators
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['collaborators', 1],
    queryFn: async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return [];

      const response = await fetch('/api/collaborators', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch collaborators');
      }
      
      return response.json();
    },
  });

  // Invite collaborator mutation
  const inviteCollaboratorMutation = useMutation({
    mutationFn: async (data: InviteCollaboratorData) => {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          projectId: 1,
          email: data.email,
          role: data.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite collaborator');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('Collaborator');
      toast({
        title: 'Collaborator invited!',
        description: 'The collaborator has been added to your wedding planning team.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to invite collaborator',
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ collaboratorId, role }: { collaboratorId: number; role: string }) => {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(`/api/collaborators/${collaboratorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast({
        title: 'Role updated!',
        description: 'Collaborator role has been changed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    },
  });

  // Remove collaborator mutation
  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: number) => {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(`/api/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove collaborator');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast({
        title: 'Collaborator removed',
        description: 'The collaborator has been removed from your wedding planning team.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove collaborator',
        variant: 'destructive',
      });
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    inviteCollaboratorMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'Planner':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Collaborator':
        return <Edit className="w-4 h-4 text-green-600" />;
      case 'Viewer':
        return <Mail className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Planner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Collaborator':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Wedding Team</h1>
          <p className="text-gray-600 mt-2">Manage who can access and edit your wedding plans</p>
        </div>
        
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blush to-rose-gold hover:from-blush/90 hover:to-rose-gold/90 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Collaborator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Add someone to your wedding planning team. They'll be able to help based on their assigned role.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: 'Planner' | 'Collaborator' | 'Viewer') => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planner">Planner - Full editing access</SelectItem>
                    <SelectItem value="Collaborator">Collaborator - Edit details & budget</SelectItem>
                    <SelectItem value="Viewer">Viewer - View only access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={inviteCollaboratorMutation.isPending} className="flex-1">
                  {inviteCollaboratorMutation.isPending ? 'Inviting...' : 'Send Invite'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collaborators List */}
      <div className="grid gap-4">
        {collaborators.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start building your wedding planning team by inviting collaborators
              </p>
              <Button onClick={() => setIsInviteOpen(true)} className="bg-gradient-to-r from-blush to-rose-gold text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Your First Collaborator
              </Button>
            </CardContent>
          </Card>
        ) : (
          collaborators.map((collaborator: any) => (
            <Card key={collaborator.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blush/20 to-rose-gold/20 rounded-full flex items-center justify-center">
                      {getRoleIcon(collaborator.role)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {collaborator.user?.username || collaborator.user?.email || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600">{collaborator.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getRoleBadgeColor(collaborator.role)} font-medium`}>
                      {collaborator.role}
                    </Badge>
                    
                    {collaborator.role !== 'Owner' && (
                      <div className="flex space-x-2">
                        <Select
                          value={collaborator.role}
                          onValueChange={(role) => updateRoleMutation.mutate({ 
                            collaboratorId: collaborator.id, 
                            role 
                          })}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planner">Planner</SelectItem>
                            <SelectItem value="Collaborator">Collaborator</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollaboratorMutation.mutate(collaborator.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do in your wedding planning workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start space-x-3">
              <Crown className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Owner</h4>
                <p className="text-sm text-gray-600">Full control over all wedding planning features and team management</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Planner</h4>
                <p className="text-sm text-gray-600">Edit all wedding details, manage collaborators, and access all features</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Edit className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Collaborator</h4>
                <p className="text-sm text-gray-600">Edit creative details, budget, and guest list - perfect for wedding party members</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Viewer</h4>
                <p className="text-sm text-gray-600">View-only access to wedding plans - great for family members who want to stay informed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}