/**
 * Centralized logging utility for enhanced error handling and debugging
 */

interface LogContext {
  [key: string]: any;
}

// Debug mode for development
const isDebugMode = process.env.NODE_ENV !== 'production';

/**
 * Log error with structured context information
 */
export function logError(
  source: string, 
  error: any, 
  context?: LogContext
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${timestamp}] ERROR ${source}:`, {
    message: errorMessage,
    stack: isDebugMode ? errorStack : undefined,
    context: context || {},
    source
  });
}

/**
 * Log info with structured context information
 */
export function logInfo(
  source: string, 
  message: string, 
  context?: LogContext
): void {
  const timestamp = new Date().toISOString();
  
  if (isDebugMode) {
    console.log(`[${timestamp}] INFO ${source}:`, message, context || {});
  }
}

/**
 * Log warning with structured context information
 */
export function logWarning(
  source: string, 
  message: string, 
  context?: LogContext
): void {
  const timestamp = new Date().toISOString();
  
  console.warn(`[${timestamp}] WARN ${source}:`, message, context || {});
}

/**
 * Log debug information (only in development)
 */
export function logDebug(
  source: string, 
  message: string, 
  context?: LogContext
): void {
  if (isDebugMode) {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] DEBUG ${source}:`, message, context || {});
  }
}