import pkg from "pg";
const { Pool } = pkg;
import { env } from "#config";
import { logger } from "#utils";

// Initialize a connection pool using your connection string
export const pool = new Pool({
    connectionString: env.POSTGRES_URI,
});

// Test the connection pool and register event listeners
export const connectPostgreSQL = async () => {
    try {
        logger.info("Connecting to PostgreSQL...");

        // Test connection checkout
        const client = await pool.connect();
        logger.info("PostgreSQL connected successfully");
        client.release(); // Release client back to the pool

        return pool;
    } catch (error) {
        logger.fatal({ err: error }, "Failed to connect to PostgreSQL");
        throw error;
    }
};

export const disconnectPostgreSQL = async () => {
    try {
        await pool.end();
        logger.info("PostgreSQL connection pool closed");
    } catch (error) {
        logger.error({ err: error }, "Failed to close PostgreSQL connection pool");
        throw error;
    }
};