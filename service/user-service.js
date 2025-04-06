import dotenv from 'dotenv';
import UserModel from '../models/user-model.js';
import bcrypt from 'bcrypt';
import MailService from './mail-service.js';
import UserDto from './dtos/user-dto.js';
import ApiError from '../exceptions/api-error.js';
import {v4} from "uuid";
import TokenService from "./token-service.js";
import ResetTokenModel from "../models/reset-token-model.js";


dotenv.config();


class UserService {
    async registration(role, email, password, firstName, lastName, phoneNumber) {
        try {
            const emailLow=email.toLowerCase();
            const candidate = await UserModel.findOne({ email: emailLow });
            if (candidate) {
                throw ApiError.BadRequest(`Користувач з такою електронною адресою ${emailLow} вже існує`);
            }
            const hashPassword = await bcrypt.hash(password, 3);
            const activationLink = v4();
            const user = await UserModel.create({role, email: emailLow, password: hashPassword,firstName, lastName, phoneNumber, activationLink });
            await MailService.sendActivationMail(emailLow, `${process.env.API_URL}/api/activate/${activationLink}`);
            const userDto = new UserDto(user);
            const tokens = TokenService.generateTokens({ ...userDto });
            await TokenService.saveToken(userDto.id, tokens.refreshToken);
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
        const emailLow=email.toLowerCase();
        const user = await UserModel.findOne({email: emailLow})
        if (!user) { throw ApiError.BadRequest('Користувач з такою електронною адресою не існує')}
        const isPassEqual = await bcrypt.compare(password, user.password)
        if (!isPassEqual) {
            throw ApiError.BadRequest('Невірний пароль')
        }
        const userDto = new UserDto(user)
        const tokens = TokenService.generateTokens({...userDto})
        await TokenService.saveToken(userDto._id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }
    async logout(refreshToken) {
        try {
            if (!refreshToken) {
                throw new Error("Refresh токен відсутній");
            }
            const token = await TokenService.removeToken({refreshToken});
            if (!token) {
                throw new Error("Не вдалося видалити токен");
            }
            return token;
        } catch (e) {
            console.error("❌ Помилка під час logout:", e.message);
            throw new Error("Внутрішня помилка сервера під час logout");
        }
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError("Refresh token missing");
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = await TokenService.findToken(refreshToken);
        if (!userData || !tokenFromDB) {
            throw ApiError.UnauthorizedError("Invalid refresh token");
        }
        const user = await UserModel.findOne({email: userData.email});
        if (!user) {
            throw ApiError.UnauthorizedError("User not found");
        }
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto._id, tokens.refreshToken);

        return {...tokens, user: userDto};
    }
    async forgotPassword(email) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('Користувач з таким email не знайдений');
        }
        const resetToken = TokenService.generate(user)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        await ResetTokenModel.create({
            user: user._id,
            token: resetToken,
            expiryDate
        });

        const resetLink = `${process.env.CLIENT_URL}/#/resetPassword?token=${resetToken}&email=${email}`;
        await MailService.sendMailForReset(email, resetLink);

        return { message: 'Інструкції для відновлення пароля надіслані на вашу пошту' };
    }

    async resetPassword(token, newPassword) {
        const resetToken = await ResetTokenModel.findOne({ token });
        if (!resetToken || resetToken.expiryDate < new Date()) {
            throw ApiError.BadRequest('Токен недійсний або термін його дії минув');
        }
        const user = await UserModel.findById(resetToken.user);
        if (!user) {
            throw ApiError.BadRequest('Користувач не знайдений');
        }

        user.password = await bcrypt.hash(newPassword, 3);
        await user.save();
        await ResetTokenModel.deleteOne({ token });
        return { message: 'Пароль успішно змінено' };
    }
    async getAllUsers() {
        const users = await UserModel.find()
        return users
    }
}

export default  new UserService();