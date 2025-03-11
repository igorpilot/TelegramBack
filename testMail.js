require("dotenv").config();
const mailService = require("./service/mail-service");

async function test() {
    const testEmail = "zhurbastudy@gmail.com";  // Вкажіть свою пошту
    const testLink = "https://example.com/activate/test";

    console.log("🛠 Тестуємо надсилання...");
    await mailService.sendActivationMail(testEmail, testLink);
}

test();
