interface LogContext {
  [key: string]: any;
}

export function logError(context: string, error: any, additionalInfo?: LogContext) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${timestamp}] ERROR in ${context}:`, {
    message: errorMessage,
    stack: errorStack,
    ...additionalInfo
  });
}

export function logInfo(context: string, message: string, data?: LogContext) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] INFO ${context}: ${message}`, data || '');
}

export function logWarning(context: string, message: string, data?: LogContext) {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] WARN ${context}: ${message}`, data || '');
}