const nodemailer = require("nodemailer");

class MailService {
    constructor() {
        console.log("SMTP CONFIG:", {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            secure: process.env.SMTP_PORT == 465
        });
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }

        })
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('SMTP connection error:', error);
            } else {
                console.log('SMTP connection successful');
            }
        });
    }

    async sendActivationMail(to, link) {
        try {
            console.log("📨 Надсилаємо лист на:", to);
            console.log("🔗 Посилання для активації:", link);

            const info = await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: to,
                subject: "Активація акаунта на " + process.env.API_URL,
                html: `<div> <h1>Для активації акаунта перейдіть за посиланням</h1><a href="${link}">${link}</a></div>`,
            });

            console.log("✅ Лист успішно відправлено:", info.response);
        } catch (error) {
            console.error("❌ Помилка при надсиланні листа:", error);
        }
    }
}

module.exports = new MailService();