export const MAIL_PURPOSES = Object.freeze({
    LOGIN_VERIFICATION: "You are attempting to log in from a new device or location. Please use the verification code below to confirm your identity.",
    PASSWORD_RESET: "We received a request to reset your password. Use the verification code below to proceed with your request.",
    EMAIL_UPDATE: "You requested to change your account email address. Please use the verification code below to authorize this update.",
    ACCOUNT_REGISTRATION: "Welcome! Please verify your email address using the one-time passcode below to activate your account.",
    TWO_FACTOR_AUTH: "Please enter the verification code below to complete your two-factor authentication security check.",
});

export const MAIL_SUBJECTS = Object.freeze({
    LOGIN_VERIFICATION: "Verify Your Login Attempt",
    PASSWORD_RESET: "Reset Your Password",
    EMAIL_UPDATE: "Confirm Email Address Update",
    ACCOUNT_REGISTRATION: "Verify Your Account",
    TWO_FACTOR_AUTH: "Two-Factor Authentication Code",
});