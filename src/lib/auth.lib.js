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
    basePath: `${env.API_PREFIX}/auth`,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async onExistingUserSignUp({ user }, request) {
            console.log("🔁 Existing user sign-up attempt for:", user.email);
            if (!user.emailVerified) {
                console.log("📧 Resending verification email to existing unverified user:", user.email);
                await auth.api.sendVerificationEmail({
                    body: { email: user.email },
                    headers: request?.headers,
                });
            }
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        async sendVerificationEmail({ user, url, token }, request) {
            console.log("📧 Better Auth triggered sendVerificationEmail for:", user.email);
            console.log("🔑 Token received:", token);
            console.log("🔗 URL received:", url);

            try {
                const subject = MAIL_SUBJECTS?.ACCOUNT_REGISTRATION || "Verify Your Account";
                const purposeText = "Welcome! Please use the verification code below to activate your account.";

                await MailService.sendEmail(
                    user.email,
                    token,
                    subject,
                    purposeText,
                    5
                );
                console.log("✅ Verification email sent successfully via MailService");
            } catch (error) {
                console.error("❌ Failed to send verification email from Better Auth hook:", error);
            }
        },
    },
    session: {
        cookie: {
            secure: env.NODE_ENV === "production",
        },
    },
});