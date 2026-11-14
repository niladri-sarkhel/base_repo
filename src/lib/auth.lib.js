import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { env } from "#config"; // Adjust based on your env loader
import { MailService } from "#services";
import { MAIL_PURPOSES, MAIL_SUBJECTS } from "#constants";

// Initialize a dedicated Postgres pool for Better Auth using your existing URI
const dbPool = new Pool({
    connectionString: env.POSTGRES_URI,
});

export const auth = betterAuth({
    database: dbPool,
    baseURL: env.APP_URL,
    secret: env.BETTERAUTH_SECRET,
    basePath: `${env.API_PREFIX}/auth`,
    user: {
        deleteUser: {
            enabled: true,
        },
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:5173", // Example if using Vite frontend
    ],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async onExistingUserSignUp({ user }, request) {
            console.log("🔁 Existing user sign-up attempt for:", user.email);
            if (!user.emailVerified) {
                console.log("📧 Resending verification OTP to existing unverified user:", user.email);
                await auth.api.sendVerificationOTP({
                    body: {
                        email: user.email,
                        type: "email-verification",
                    },
                    headers: request?.headers,
                });
            }
        },
    },
    emailVerification: {
        autoSignInAfterVerification: true,
    },
    plugins: [
        emailOTP({
            overrideDefaultEmailVerification: true,
            sendVerificationOnSignUp: true,
            expiresIn: env.OTP_TTL_SECONDS || 300,
            otpLength: 6,
            async sendVerificationOTP({ email, otp, type }, request) {
                console.log(`📧 Better Auth sending OTP for [${type}] to:`, email);
                console.log("🔑 OTP generated:", otp);

                try {
                    let subject = MAIL_SUBJECTS?.ACCOUNT_REGISTRATION || "Verify Your Account";
                    let purposeText = MAIL_PURPOSES?.ACCOUNT_REGISTRATION || "Welcome! Please use the verification code below to activate your account.";

                    if (type === "forget-password") {
                        subject = MAIL_SUBJECTS?.PASSWORD_RESET || "Reset Your Password";
                        purposeText = MAIL_PURPOSES?.PASSWORD_RESET || "We received a request to reset your password. Use the verification code below to proceed with your request.";
                    } else if (type === "sign-in") {
                        subject = MAIL_SUBJECTS?.LOGIN_VERIFICATION || "Verify Your Login Attempt";
                        purposeText = MAIL_PURPOSES?.LOGIN_VERIFICATION || "Please use the verification code below to confirm your identity.";
                    } else if (type === "change-email") {
                        subject = MAIL_SUBJECTS?.EMAIL_UPDATE || "Confirm Email Address Update";
                        purposeText = MAIL_PURPOSES?.EMAIL_UPDATE || "Please use the verification code below to authorize this update.";
                    }

                    const expiryMinutes = (env.OTP_TTL_SECONDS || 300) / 60;

                    await MailService.sendEmail(
                        email,
                        otp,
                        subject,
                        purposeText,
                        expiryMinutes
                    );
                    console.log("✅ Verification OTP email sent successfully via MailService");
                } catch (error) {
                    console.error("❌ Failed to send verification OTP email from Better Auth hook:", error);
                }
            },
        }),
    ],
    advanced: {
        // Disables origin & CSRF requirement for API tools (Bruno, Postman) in development
        disableCSRFCheck: env.NODE_ENV !== "production",
    },
    session: {
        cookie: {
            secure: env.NODE_ENV === "production",
        },
    },
});