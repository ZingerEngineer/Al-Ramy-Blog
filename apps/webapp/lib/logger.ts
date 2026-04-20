import pino from 'pino';

/**
 * Server-side logger utility using Pino
 * - Development: Pretty printed, colorized logs
 * - Production: JSON structured logs
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = pino({
  name: 'al-ramy-blog',
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Base metadata included in all logs
  base: {
    env: process.env.NODE_ENV,
    app: 'webapp',
  },

  // ISO timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Format level as severity for better compatibility with log aggregators
  formatters: {
    level: (label) => ({ severity: label.toUpperCase() }),
  },

  // Serializers for common objects
  serializers: {
    // Redact sensitive user information
    user: (user: unknown) => {
      const u = user as Record<string, unknown>;
      return {
        id: u?.id,
        email: u?.email,
        role: u?.role,
        // Explicitly exclude password, tokens, etc.
      };
    },

    // Format errors properly
    err: pino.stdSerializers.err,

    // Redact sensitive request data
    req: (req: unknown) => {
      const r = req as Record<string, unknown>;
      const headers = r?.headers as Record<string, unknown> | undefined;
      return {
        method: r?.method,
        url: r?.url,
        headers: {
          host: headers?.host,
          'user-agent': headers?.['user-agent'],
          // Exclude authorization headers and cookies
        },
      };
    },
  },

  // Transport configuration (pretty print in development)
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
});

/**
 * Create a child logger with additional context
 * @param context - Additional context to include in all logs
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log authentication events
 */
export const authLogger = createLogger({ module: 'auth' });

/**
 * Log API events
 */
export const apiLogger = createLogger({ module: 'api' });

/**
 * Log client errors reported from the browser
 */
export const clientErrorLogger = createLogger({ module: 'client-error' });

export default logger;
