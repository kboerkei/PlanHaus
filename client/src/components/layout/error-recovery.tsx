import { useState } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorRecoveryProps {
  error?: Error;
  onRetry?: () => void;
  onNavigateHome?: () => void;
}

export default function ErrorRecovery({ error, onRetry, onNavigateHome }: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Don't worry, your data is safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 font-mono break-words">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            {onNavigateHome && (
              <Button 
                onClick={onNavigateHome}
                className="flex-1 gradient-blush-rose text-white"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}