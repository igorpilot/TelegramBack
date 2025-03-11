require("dotenv").config();
const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDto = require("./dtos/user-dto");
const ApiError = require("../exceptions/api-error");

console.log("Loaded ENV:", process.env.SMTP_HOST, process.env.SMTP_PORT);


class UserService {
    async registration(email, password, firstName, lastName, phoneNumber) {

        try {

            const candidate = await UserModel.findOne({ email });
            if (candidate) {
                console.log("⚠️ Користувач вже існує:", candidate.email);
                throw ApiError.BadRequest(`Користувач з такою електронною адресою ${email} вже існує`);
            }

            const hashPassword = await bcrypt.hash(password, 3);
            const activationLink = uuid.v4();
            const user = await UserModel.create({ email, password: hashPassword,firstName, lastName, phoneNumber, activationLink });

            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

            console.log("✅ Лист відправлено!");

            const userDto = new UserDto(user);
            const tokens = tokenService.generateTokens({ ...userDto });
            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            return { ...tokens, user: userDto };
        } catch (error) {
            console.error("❌ Помилка в registration():", error);
            throw error;
        }
    }
    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) { throw ApiError.BadRequest('Неправильна силка активації')}
        user.isActivated = true
        await user.save()
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) { throw ApiError.BadRequest('Користувач з такою електронною адресою вже існує')}
        const isPassEqual = await bcrypt.compare(password, user.password)
        if (!isPassEqual) {
            throw ApiError.BadRequest('Невірний пароль')
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto._id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        try {
            console.log("🔒 Логування з refreshToken:", refreshToken);

            // Перевірка, чи існує refreshToken
            if (!refreshToken) {
                throw new Error("Refresh токен відсутній");
            }

            const token = await tokenService.removeToken({refreshToken});
            if (!token) {
                throw new Error("Не вдалося видалити токен");
            }

            console.log("Токен успішно видалено:", token);
            return token;
        } catch (e) {
            console.error("❌ Помилка під час logout:", e.message);
            throw new Error("Внутрішня помилка сервера під час logout");
        }
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnathorizedError("Refresh token missing");
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        console.log("userData після validateRefreshToken:", userData);

        const tokenFromDB = await tokenService.findToken(refreshToken);
        console.log("tokenFromDB:", tokenFromDB);

        if (!userData || !tokenFromDB) {
            throw ApiError.UnathorizedError("Invalid refresh token");
        }

        const user = await UserModel.findOne({email: userData.email});
        if (!user) {
            console.log("❌ Користувач не знайдений!");
            throw ApiError.UnathorizedError("User not found");
        }

        console.log("User data:", user); // Перевірка чи існують дані користувача

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto._id, tokens.refreshToken);

        return {...tokens, user: userDto};
    }

    async getAllUsers() {
        const users = await UserModel.find()
        return users
    }
}

module.exports =  new UserService();