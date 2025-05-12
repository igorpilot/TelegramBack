import crypto from 'crypto';

export function verifyTelegramHash(data, botToken) {
    const { hash, ...rest } = data;
    const secret = crypto.createHash("sha256").update(botToken).digest();

    const dataCheckString = Object.keys(rest)
        .sort()
        .map(key => `${key}=${rest[key]}`)
        .join("\n");

    const hmac = crypto.createHmac("sha256", secret)
        .update(dataCheckString)
        .digest("hex");

    return hmac === hash;
}