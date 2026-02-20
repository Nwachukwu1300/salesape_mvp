import winston from 'winston';
import path from 'path';

/**
 * Production-grade structured logging
 * Handles console and file logging with appropriate levels
 * Supports context tags for better log organization
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

/**
 * Enhanced log format with context support
 * Example: "[Service] [ServiceName] Message with context"
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? ` [${context}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}]${contextStr} ${message}${metaStr}`.trim();
  })
);

const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }),
];

// File transport only in production
if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: logFormat,
    })
  );
}

/**
 * Base logger instance
 */
const baseLogger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
});

/**
 * Create a scoped logger with context (e.g., service name, module name)
 * Usage:
 *   const log = createContextLogger('ContentService');
 *   log.info('Processing content', { contentId: '123' });
 *   // Output: [YYYY-MM-DD HH:mm:ss] [INFO] [ContentService] Processing content {"contentId":"123"}
 */
export function createContextLogger(context: string) {
  return {
    debug: (message: string, meta?: Record<string, any>) => {
      baseLogger.debug(message, { context, ...meta });
    },
    info: (message: string, meta?: Record<string, any>) => {
      baseLogger.info(message, { context, ...meta });
    },
    warn: (message: string, meta?: Record<string, any>) => {
      baseLogger.warn(message, { context, ...meta });
    },
    error: (message: string, error?: Error | Record<string, any>) => {
      if (error instanceof Error) {
        baseLogger.error(message, { context, error: error.message, stack: error.stack });
      } else {
        baseLogger.error(message, { context, ...error });
      }
    },
  };
}

export const logger = baseLogger;

/**
 * Express middleware for request/response logging
 */
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(level, `${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      user: req.userId || 'anonymous',
    });
  });

  next();
}

export default logger;
