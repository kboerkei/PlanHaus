import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Heart, User, Mail, Lock, UserPlus, LogIn, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-cream to-champagne/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blush/20 to-rose-200/20 rounded-full blur-3xl animate-gentle-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-br from-champagne/30 to-rose-300/20 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-6 h-6 text-rose-300/40 animate-sparkle">
          <Sparkles className="w-full h-full" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Elegant Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          {/* Animated Heart Icon with Gradient */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto shadow-soft animate-gentle-float">
              <Heart className="text-white w-10 h-10 fill-current" />
            </div>
            {/* Subtle sparkle decoration */}
            <div className="absolute -top-1 -right-1 w-4 h-4 text-rose-300 animate-sparkle">
              <Sparkles className="w-full h-full" />
            </div>
          </div>
          
          {/* Main Headline - Bold Serif */}
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-800 mb-4 animate-slide-up tracking-tight">
            PlanHaus
          </h1>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
            <div className="mx-3 w-2 h-2 bg-rose-300 rounded-full animate-sparkle"></div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
          </div>
          
          {/* Subheadline - Clean Sans-serif */}
          <p className="font-inter text-xl md:text-2xl text-gray-600 mb-8 animate-slide-up leading-relaxed" style={{ animationDelay: '0.4s' }}>
            A smarter way to plan your best day—with AI that gets you.
          </p>
          
          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => demoLoginMutation.mutate()}
              disabled={demoLoginMutation.isPending}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-dm-sans font-medium rounded-full shadow-soft hover:shadow-medium hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {demoLoginMutation.isPending ? (
                "Starting your journey..."
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  Try the Demo
                </>
              )}
            </button>
          </div>
          
          {/* Subtle tagline */}
          <p className="text-sm text-gray-500 font-inter animate-fade-in" style={{ animationDelay: '0.8s' }}>
            Or create your account below to get started
          </p>
        </div>

        <Card className="shadow-soft border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-dm-serif text-gray-800">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="font-inter text-gray-600">
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
                  <Label className="flex items-center gap-2 font-dm-sans font-medium text-gray-700">
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
                    className="font-inter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-dm-sans font-medium text-gray-700">
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
                    className="font-inter"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-dm-sans shadow-soft"
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

                <div className="text-center text-sm text-gray-500 my-4 font-inter">or</div>

                <Button 
                  type="button"
                  onClick={() => demoLoginMutation.mutate()}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-dm-sans"
                  disabled={demoLoginMutation.isPending}
                >
                  {demoLoginMutation.isPending ? (
                    "Logging in..."
                  ) : (
                    "Continue with Demo"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-dm-sans font-medium text-gray-700">
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
                    className="font-inter"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-dm-sans font-medium text-gray-700">
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
                    className="font-inter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-dm-sans font-medium text-gray-700">
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
                    className="font-inter"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-dm-sans shadow-soft"
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
                className="text-gray-600 hover:text-rose-500 font-inter"
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