import crypto from "node:crypto";

/**
 * Generates a cryptographically secure One-Time Password (OTP).
 * 
 * @param {Object} options - Configuration options
 * @param {number} [options.length=6] - Length of the OTP (between 4 and 10)
 * @param {boolean} [options.asString=true] - Whether to return the OTP as a string
 * @returns {string|number} The generated OTP
 */

export const generateOTP = ({ length = 6, asString = true } = {}) => {
    if (!Number.isInteger(length) || length < 4 || length > 10) {
        throw new RangeError("OTP length must be an integer between 4 and 10.");
    }

    // Use BigInt for safe bounds calculation on larger lengths
    const min = Number(10n ** BigInt(length - 1));
    const max = Number(10n ** BigInt(length));

    // crypto.randomInt is exclusive of the max bound, so max is correct here
    const otp = crypto.randomInt(min, max);

    return asString ? String(otp) : otp;
};