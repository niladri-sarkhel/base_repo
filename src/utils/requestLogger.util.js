import { logger } from "#utils";

export const requestLogger = (req, res, next) => {
    // Capture high-resolution start time
    const startTime = process.hrtime();

    // Listen for the response to finish emitting to the client
    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const responseTimeMs = Number((seconds * 1000 + nanoseconds / 1e6).toFixed(2));

        const logPayload = {
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            responseTime: `${responseTimeMs}ms`,
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] || null,
            userId: req.user?.id || null, // Captures authenticated user ID if available
        };

        // Dynamically adjust log level based on HTTP status code
        if (res.statusCode >= 500) {
            logger.error(logPayload, `[${req.method}] ${req.originalUrl} -> Server Error`);
        } else if (res.statusCode >= 400) {
            logger.warn(logPayload, `[${req.method}] ${req.originalUrl} -> Client Error`);
        } else {
            logger.info(logPayload, `[${req.method}] ${req.originalUrl} -> Success`);
        }
    });

    next();
};