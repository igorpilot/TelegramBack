import crypto from 'crypto';
import * as querystring from "node:querystring";

export function verifyTelegramHash(initData, botToken) {
    if (!initData || typeof initData !== 'string') {
        console.error("❌ Порожній або невалідний initData");
        return false;
    }

    const parsedData = querystring.parse(initData);
    const receivedHash = parsedData.hash;

    if (!receivedHash) {
        console.error("❌ Hash не знайдено в initData");
        return false;
    }

    // Видаляємо hash з копії обʼєкта
    delete parsedData.hash;

    // Створюємо перевірочний рядок (тільки для ключів з валідними значеннями)
    const dataCheckString = Object.keys(parsedData)
        .filter((key) => parsedData[key] !== undefined)
        .sort()
        .map((key) => `${key}=${parsedData[key]}`)
        .join("\n");

    try {
        const secretKey = crypto.createHash("sha256").update(botToken).digest();
        const hmac = crypto.createHmac("sha256", secretKey)
            .update(dataCheckString)
            .digest("hex");

        return hmac === receivedHash;
    } catch (err) {
        console.error("❌ Помилка при створенні HMAC:", err);
        return false;
    }
}