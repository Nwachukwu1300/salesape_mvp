import winston from 'winston';
import path from 'path';
/**
 * Production-grade structured logging
 * Handles console and file logging with appropriate levels
 */
const isDevelopment = process.env.NODE_ENV !== 'production';
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}] ${message} ${metaStr}`.trim();
}));
const transports = [
    // Console transport
    new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
];
// File transport only in production
if (!isDevelopment) {
    transports.push(new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: logFormat,
    }), new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format: logFormat,
    }));
}
export const logger = winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: logFormat,
    transports,
    exceptionHandlers: [
        new winston.transports.Console(),
    ],
});
/**
 * Express middleware for request/response logging
 */
export function requestLogger(req, res, next) {
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
//# sourceMappingURL=logger.js.map