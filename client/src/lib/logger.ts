// Logging service for production and development
interface LogContext {
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  context?: LogContext;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private createLogEntry(level: LogLevel, category: string, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
    };
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }
    
    if (this.isProduction) {
      // Only log warnings and errors in production
      return level === 'warn' || level === 'error';
    }
    
    return false;
  }

  debug(category: string, message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', category, message, context);
    this.addToBuffer(entry);
    
    if (this.isDevelopment) {
      console.debug(`[${entry.timestamp}] DEBUG ${category}: ${message}`, context || '');
    }
  }

  info(category: string, message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', category, message, context);
    this.addToBuffer(entry);
    
    if (this.isDevelopment) {
      console.info(`[${entry.timestamp}] INFO ${category}: ${message}`, context || '');
    }
  }

  warn(category: string, message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', category, message, context);
    this.addToBuffer(entry);
    
    console.warn(`[${entry.timestamp}] WARN ${category}: ${message}`, context || '');
  }

  error(category: string, error: Error | string, context?: LogContext) {
    if (!this.shouldLog('error')) return;
    
    const errorMessage = error instanceof Error ? error.message : error;
    const entry = this.createLogEntry('error', category, errorMessage, {
      ...context,
      ...(error instanceof Error && { stack: error.stack }),
    });
    this.addToBuffer(entry);
    
    console.error(`[${entry.timestamp}] ERROR ${category}: ${errorMessage}`, context || '');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  // Get recent logs for debugging
  getRecentLogs(limit: number = 10): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  // Clear log buffer
  clearBuffer() {
    this.logBuffer = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions
export const logDebug = (category: string, message: string, context?: LogContext) => {
  logger.debug(category, message, context);
};

export const logInfo = (category: string, message: string, context?: LogContext) => {
  logger.info(category, message, context);
};

export const logWarn = (category: string, message: string, context?: LogContext) => {
  logger.warn(category, message, context);
};

export const logError = (category: string, error: Error | string, context?: LogContext) => {
  logger.error(category, error, context);
};

export default logger; 