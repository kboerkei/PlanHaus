import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Alert, AlertDescription } from "./alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  Oops! Something went wrong
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    We encountered an unexpected error while processing your request. 
                    Don't worry - your wedding plans are safe!
                  </AlertDescription>
                </Alert>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                      Technical Details (Development)
                    </summary>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-auto max-h-40">
                      <div className="text-red-600 dark:text-red-400 font-semibold mb-1">
                        {this.state.error.name}: {this.state.error.message}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {this.state.error.stack}
                      </div>
                    </div>
                  </details>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={this.handleGoHome}
                      className="flex-1"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Go Home
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={this.handleReload}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reload
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  If this problem persists, please contact support or try refreshing the page.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified wrapper for easier usage
interface SimpleErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SimpleErrorBoundary({ children, fallback }: SimpleErrorBoundaryProps) {
  return (
    <EnhancedErrorBoundary fallback={fallback}>
      {children}
    </EnhancedErrorBoundary>
  );
}

// Hook for error reporting in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    console.error('Manual error report:', error, errorInfo);
    
    // In production, you might want to send to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReporting(error, errorInfo);
    }
  };
}