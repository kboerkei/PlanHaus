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
  onAuth: (user: any, sessionId: string) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { 
      email: "", 
      password: "" 
    },
    mode: "onChange"
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      username: "", 
      email: "", 
      password: "", 
      avatar: "" 
    },
    mode: "onChange"
  });

  // Debug logging
  console.log('Auth component rendered, isLogin:', isLogin);

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => 
      apiRequest<{ user: any; sessionId: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (data) => {
      onAuth(data.user, data.sessionId);
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

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      apiRequest<{ user: any; sessionId: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (data) => {
      onAuth(data.user, data.sessionId);
      toast({
        title: "Account created!",
        description: "Welcome to Gatherly. Let's start planning your perfect wedding.",
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

  const onLoginSubmit = (data: LoginFormData) => {
    console.log('Login form submitted:', data);
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    console.log('Register form submitted:', data);
    registerMutation.mutate(data);
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
          <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">Gatherly</h1>
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
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail size={16} />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            {...field}
                            autoComplete="email"
                            autoFocus={isLogin}
                            type="email"
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock size={16} />
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field}
                            autoComplete="current-password"
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User size={16} />
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            {...field}
                            autoComplete="name"
                            autoFocus={!isLogin}
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail size={16} />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            {...field}
                            autoComplete="email"
                            type="email"
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock size={16} />
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Choose a secure password" 
                            {...field}
                            autoComplete="new-password"
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
              </Form>
            )}

            {/* Test input field for debugging */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium mb-2">Test Input (for debugging):</label>
              <input
                type="text"
                placeholder="Type here to test..."
                className="w-full p-2 border border-gray-300 rounded"
                onChange={(e) => console.log('Test input value:', e.target.value)}
              />
            </div>

            {/* Demo login button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={demoLogin}
              disabled={loginMutation.isPending}
            >
              Try Demo Account
            </Button>

            {/* Toggle between login/register */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
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