import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Camera, Save, LogOut, Edit, Heart, Calendar, Gift, Users, Utensils, Building } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

const profileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  avatar: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileProps {
  user: any;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Unable to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changeEventTypeMutation = useMutation({
    mutationFn: async (eventType: string) => {
      const response = await fetch('/api/auth/select-event-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({ eventType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to change event type');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event type changed",
        description: "Your event type has been updated successfully.",
      });
      // Reload the page to refresh the entire app with new event type
      window.location.reload();
    },
    onError: () => {
      toast({
        title: "Change failed",
        description: "Unable to change event type. Please try again.",
        variant: "destructive",
      });
    },
  });

  const eventTypes = [
    { id: 'wedding', name: 'Wedding', icon: Heart, color: 'text-rose-600' },
    { id: 'birthday', name: 'Birthday Party', icon: Calendar, color: 'text-purple-600' },
    { id: 'baby_shower', name: 'Baby Shower', icon: Gift, color: 'text-blue-600' },
    { id: 'reunion', name: 'Reunion', icon: Users, color: 'text-green-600' },
    { id: 'dinner_party', name: 'Dinner Party', icon: Utensils, color: 'text-orange-600' },
    { id: 'corporate', name: 'Corporate Event', icon: Building, color: 'text-slate-600' },
  ];

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      onLogout();
    },
    onError: () => {
      // Force logout even if API call fails
      toast({
        title: "Logged out",
        description: "You've been logged out.",
      });
      onLogout();
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-0">
        <div className="max-w-2xl mx-auto p-6 pb-20 md:pb-6">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera size={20} />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Update your profile picture to personalize your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-lg bg-blush text-white">
                      {user?.username ? getInitials(user.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Enter a URL for your profile picture, or leave blank for initials
                    </p>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      value={form.watch("avatar")}
                      onChange={(e) => form.setValue("avatar", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Update your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your display name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="gradient-blush-rose"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Event Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Event Type (Demo Mode)
                </CardTitle>
                <CardDescription>
                  Switch between different event types to explore all planning features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {eventTypes.map((event) => {
                    const Icon = event.icon;
                    const isCurrentType = user?.eventType === event.id;
                    
                    return (
                      <Button
                        key={event.id}
                        variant={isCurrentType ? "default" : "outline"}
                        className={`h-auto p-4 flex flex-col items-center gap-2 ${
                          isCurrentType 
                            ? 'gradient-blush-rose text-white' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => changeEventTypeMutation.mutate(event.id)}
                        disabled={changeEventTypeMutation.isPending || isCurrentType}
                      >
                        <Icon className={`w-5 h-5 ${isCurrentType ? 'text-white' : event.color}`} />
                        <span className="text-sm font-medium">{event.name}</span>
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Current: {eventTypes.find(e => e.id === user?.eventType)?.name || 'None selected'}
                </p>
              </CardContent>
            </Card>

            {/* Wedding Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart size={20} />
                  Planning Information
                </CardTitle>
                <CardDescription>
                  Manage your event planning details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blush/5 rounded-lg border border-blush/20">
                    <div>
                      <h4 className="font-medium">Event Intake Form</h4>
                      <p className="text-sm text-gray-600">Update your event details, preferences, and vision</p>
                    </div>
                    <Link href="/intake">
                      <Button variant="outline" className="border-blush text-blush hover:bg-blush hover:text-white">
                        <Edit size={16} className="mr-2" />
                        Edit Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account settings and session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Current Session</h4>
                      <p className="text-sm text-gray-600">Signed in as {user?.email}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut size={16} className="mr-2" />
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}