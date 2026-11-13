import { pool } from "#config";
import { MailService } from "#services";
import { logger } from "#utils";
import { MAIL_PURPOSES, MAIL_SUBJECTS } from "#constants";
import { generateOTP } from "#utils";
import { env } from "#config";

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

    async sendTestEmail(req, res, next) {
        try {
            const { to } = req.body;

            if (!to) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error: 'to' email address is required in the request body.",
                });
            }

            // Generate a random 6-digit test OTP
            const testOtp = generateOTP();

            const subject = MAIL_SUBJECTS["LOGIN_VERIFICATION"];
            const purposeText = MAIL_PURPOSES["LOGIN_VERIFICATION"];
            const expiryMinutes = env.OTP_TTL_SECONDS / 60;

            // Call your mail service
            await MailService.sendEmail(to, testOtp, subject, purposeText, expiryMinutes);

            return res.status(200).json({
                success: true,
                message: `Test email successfully dispatched to ${to}`,
                meta: {
                    otpSent: testOtp,
                    expiresIn: `${expiryMinutes} mins`,
                },
            });
        } catch (error) {
            logger.error(`❌ Test email controller failed: ${error.message}`);
            return next(error); // Passes the error to your global error handling middleware
        }
    };


}

export const testController = new TestControllerClass();