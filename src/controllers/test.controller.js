import { pool } from "#config";
import { BadRequestError, ValidationError } from "#errors";

export class TestControllerClass {
    // 1. Basic ping route for uptime check
    ping(_req, res) {
        return res.status(200).json({
            success: true,
            data: {
                message: "pong 🏓",
                timestamp: new Date().toISOString(),
            },
            error: null,
        });
    }

    // 2. Database connectivity test (queries PostgreSQL pool)
    async dbTest(_req, res, next) {
        try {
            const result = await pool.query(
                "SELECT NOW() as current_time, version() as db_version"
            );
            const dbInfo = result.rows[0];

            return res.status(200).json({
                success: true,
                data: {
                    message: "PostgreSQL connection is healthy",
                    currentTime: dbInfo.current_time,
                    postgresVersion: dbInfo.db_version,
                },
                error: null,
            });
        } catch (error) {
            next(error); // Passes error straight to your global handleReqErrors middleware
        }
    }
}

export const testController = new TestControllerClass();