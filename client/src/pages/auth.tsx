import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Heart, User, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthProps {
  onAuth: (user: any, sessionId: string, isRegistration?: boolean) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  // Simple state for form values
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" });

  // Reset forms when switching modes to ensure clean state
  const handleModeSwitch = (newIsLogin: boolean) => {
    setIsLogin(newIsLogin);
    setLoginData({ email: "", password: "" });
    setRegisterData({ username: "", email: "", password: "" });
  };



  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => 
      apiRequest<{ user: any; sessionId: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (data) => {
      onAuth(data.user, data.sessionId, false);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: () => 
      apiRequest<{ user: any; sessionId: string }>("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (data) => {
      onAuth(data.user, data.sessionId, false);
      toast({
        title: "Welcome to PlanHaus!",
        description: "Logged in as demo user.",
      });
    },
    onError: () => {
      toast({
        title: "Demo login failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      apiRequest<{ user: any; sessionId: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (data) => {
      onAuth(data.user, data.sessionId, true);
      toast({
        title: "Account created!",
        description: "Welcome to PlanHaus. Let's start planning your perfect wedding.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(loginData);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    if (registerData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ ...registerData, avatar: "" });
  };

  const demoLogin = () => {
    loginMutation.mutate({
      email: "demo@example.com",
      password: "demo123",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-blush-rose rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white" size={32} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">PlanHaus</h1>
          <p className="text-gray-600">AI-Powered Wedding Planning</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Sign in to continue planning your perfect wedding"
                : "Start your wedding planning journey with AI assistance"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </Label>
                  <Input 
                    type="email"
                    placeholder="your@email.com" 
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    autoComplete="email"
                    autoFocus={isLogin}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </Label>
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-blush-rose"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    "Signing in..."
                  ) : (
                    <>
                      <LogIn size={16} className="mr-2" />
                      Sign In
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500 my-4">or</div>

                <Button 
                  type="button"
                  onClick={() => demoLoginMutation.mutate()}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  disabled={demoLoginMutation.isPending}
                >
                  {demoLoginMutation.isPending ? (
                    "Logging in..."
                  ) : (
                    "Try Demo (demo@example.com)"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User size={16} />
                    Username
                  </Label>
                  <Input 
                    placeholder="Your name" 
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    autoComplete="name"
                    autoFocus={!isLogin}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </Label>
                  <Input 
                    type="email"
                    placeholder="your@email.com" 
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    autoComplete="email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </Label>
                  <Input 
                    type="password" 
                    placeholder="Choose a secure password" 
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-blush-rose"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    "Creating account..."
                  ) : (
                    <>
                      <UserPlus size={16} className="mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            )}



            {/* Toggle between login/register */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => handleModeSwitch(!isLogin)}
                className="text-gray-600 hover:text-blush"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}