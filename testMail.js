import dotenv from 'dotenv';
import mailService from "./service/mail-service.js";
dotenv.config();


async function test() {
    const testEmail = "zhurbastudy@gmail.com";
    const testLink = "https://example.com/activate/test";

    console.log("🛠 Тестуємо надсилання...");
    await mailService.sendActivationMail(testEmail, testLink);
}

test();
