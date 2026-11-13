import joi from "joi";

const envSchema = joi.object({
    NODE_ENV: joi
        .string()
        .valid("development", "test", "production")
        .default("development"),

    APP_PORT: joi.number().integer().port().default(3000),

    APP_NAME: joi.string().default("base_repo"),

    APP_URL: joi
        .string()
        .pattern(/^https?:\/\/.+/)
        .required()
        .messages({
            "string.pattern.base":
                "APP_URL must be a valid URL starting with http:// or https://",
        }),

    API_PREFIX: joi.string().default("/api/v1"),

    LOG_LEVEL: joi
        .string()
        .valid("fatal", "error", "warn", "info", "debug", "trace")
        .default("info"),

    POSTGRES_URI: joi
        .string()
        .pattern(/^(postgres:\/\/|postgresql:\/\/)/)
        .required()
        .messages({
            "string.pattern.base":
                "POSTGRES_URI must be a valid connection string starting with postgresql://",
        }),

    POSTGRES_USER: joi.string().required(),

    POSTGRES_PASSWORD: joi.string().required(),

    POSTGRES_DB: joi.string().required(),

    POSTGRES_PORT: joi.number().integer().port().default(5432),

    JWT_SECRET: joi.string().min(16).required().messages({
        "string.min": "JWT_SECRET must be at least 16 characters long for security",
    }),

    JWT_EXPIRES_IN: joi.string().default("7d"),

    BETTERAUTH_SECRET: joi.string().min(16).required().messages({
        "string.min": "BETTERAUTH_SECRET must be at least 16 characters long for security",
    }),

    REDIS_HOST: joi.string().required(),

    REDIS_PORT: joi.number().integer().port().default(6379),

    REDIS_PASSWORD: joi.string().allow("").default(""),

    SMTP_HOST: joi.string().required(),

    SMTP_PORT: joi.number().integer().port().required(),

    SMTP_SECURE: joi.boolean().default(false),

    SMTP_USER: joi.string().allow("").default(""),

    SMTP_PASS: joi.string().allow("").default(""),

    SMTP_FROM: joi.string().required(),

    OTP_TTL_SECONDS: joi.number().integer().default(300),
});

const { value, error } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
});

if (error) {
    const errors = error.details.map((detail) => detail.message);

    console.error({
        message: "❌ Failed to start server due to invalid environment variables",
        errors,
    });

    process.exit(1);
}

export const env = Object.freeze(value);

console.log("✅ Environment variables loaded and validated successfully");