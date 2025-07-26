/**
 * Enhanced logging utilities for the wedding planning app
 */

export interface LogContext {
  userId?: number;
  sessionId?: string;
  ip?: string;
  endpoint?: string;
  [key: string]: any;
}

export function logInfo(category: string, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level: 'INFO',
    category,
    message,
    ...(context && { context })
  };
  
  console.log(`[${timestamp}] INFO ${category}: ${message}`, context || '');
}

export function logWarning(category: string, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level: 'WARNING',
    category,
    message,
    ...(context && { context })
  };
  
  console.warn(`[${timestamp}] WARNING ${category}: ${message}`, context || '');
}

export function logError(category: string, error: Error | string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : error;
  const logData = {
    timestamp,
    level: 'ERROR',
    category,
    error: errorMessage,
    ...(error instanceof Error && { stack: error.stack }),
    ...(context && { context })
  };
  
  console.error(`[${timestamp}] ERROR ${category}: ${errorMessage}`, context || '');
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}

export function logDebug(category: string, message: string, context?: LogContext) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] DEBUG ${category}: ${message}`, context || '');
  }
}