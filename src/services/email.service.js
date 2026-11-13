import nodemailer from "nodemailer";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "#config";
import { logger } from "#utils";
import { MailServiceError, MailTemplateError } from "#errors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MailServiceClass {
    _transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });

    _fromAddress = env.SMTP_FROM;
    _templatePath = path.join(__dirname, "../templates/email-template.html");
    _cachedHtml = null;

    _loadTemplate = async () => {
        if (this._cachedHtml) return this._cachedHtml;
        try {
            this._cachedHtml = await fs.readFile(this._templatePath, "utf8");
            return this._cachedHtml;
        } catch (error) {
            throw new MailTemplateError({
                message: "Critical: Mail infrastructure layout missing.",
                errors: [error.message],
            });
        }
    };

    sendEmail = async (to, otp, subject, purposeText, expiryMinutes = 5) => {
        const rawTemplate = await this._loadTemplate();

        const appName = env.APP_NAME || "Global Marketplace";
        const currentYear = new Date().getFullYear().toString();
        const expirationDuration = `${expiryMinutes} mins`;

        // 1. Calculate future expiration time using your target timezone
        const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);
        const expirationTime = expiryDate.toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata", // <-- Forces IST instead of UTC
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).toLowerCase(); // e.g., "2:27 p.m."

        // Replace all dynamic placeholders safely across the template
        const personalizedHtml = rawTemplate
            .replaceAll("{{APP_NAME}}", appName)
            .replaceAll("{{OTP}}", otp)
            .replaceAll("{{PURPOSE_TEXT}}", purposeText)
            .replaceAll("{{EXPIRATION_DURATION}}", expirationDuration)
            .replaceAll("{{EXPIRATION_TIME}}", expirationTime)
            .replaceAll("{{CURRENT_YEAR}}", currentYear);

        try {
            const deliveryReceipt = await this._transporter.sendMail({
                from: this._fromAddress,
                to,
                subject,
                html: personalizedHtml,
            });

            logger.info(
                `✅ Outbound email delivered to: ${to} | Expires at: ${expirationTime} [ID: ${deliveryReceipt.messageId}]`,
            );

            return true;
        } catch (error) {
            throw new MailServiceError({
                message: "Unable to complete security authentication message transmission.",
                errors: [error.message],
            });
        }
    };
}

export const MailService = new MailServiceClass();