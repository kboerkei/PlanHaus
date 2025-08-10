import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Get return URL from query params
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo') || '/dashboard';

  useEffect(() => {
    // Check if user is already logged in
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      setLocation(returnTo);
    }
  }, [returnTo, setLocation]);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Store session data
        if (data.sessionId) {
          localStorage.setItem('sessionId', data.sessionId);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to PlanHaus",
        });
        
        // Redirect to return URL
        setLocation(returnTo);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-rose-900 flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-rose-600" fill="currentColor" />
            PlanHaus
          </CardTitle>
          <p className="text-muted-foreground">
            {returnTo !== '/dashboard' ? 'Session expired. Please log in to continue.' : 'Welcome to your wedding planning hub'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@example.com"
                value="demo@example.com"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value="demo"
                disabled
              />
            </div>
          </div>
          
          <Button
            onClick={handleDemoLogin}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login to Demo"}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            This is a demo application with sample wedding planning data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}