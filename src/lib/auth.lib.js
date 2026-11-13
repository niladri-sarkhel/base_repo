import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "#config"; // Adjust based on your env loader
import { MailService } from "#services";
import { MAIL_SUBJECTS } from "#constants";

// Initialize a dedicated Postgres pool for Better Auth using your existing URI
const dbPool = new Pool({
    connectionString: env.POSTGRES_URI,
});

export const auth = betterAuth({
    database: dbPool,
    baseURL: env.APP_URL,
    secret: env.BETTERAUTH_SECRET,
    basePath: `${env.API_PREFIX}/auth`, // 👈 Tell Better Auth to expect routes under /api/v1/auth
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendVerificationEmail({ user, url, token }) {
            // 🚀 THIS IS WHERE OUR CUSTOM MAIL SERVICE TAKES OVER!
            const subject = MAIL_SUBJECTS.ACCOUNT_REGISTRATION || "Verify Your Account";
            const purposeText = "Welcome to Global Marketplace! Please use the verification code/link below to activate your account.";

            // Better Auth can send tokens or links. If using OTP/tokens, we pass it directly:
            await MailService.sendEmail(
                user.email,
                token, // or verification link depending on configuration
                subject,
                purposeText,
                5 // expiry minutes
            );
        },
    },
    session: {
        cookie: {
            secure: env.NODE_ENV === "production",
        },
    },
});