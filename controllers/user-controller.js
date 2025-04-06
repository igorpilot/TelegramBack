import UserService from '../service/user-service.js';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/api-error.js';

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Помилка при валідації', errors.array()));
            }

            const {role, email, password, firstName, lastName, phoneNumber } = req.body;

            const userData = await UserService.registration(role, email, password, firstName, lastName, phoneNumber);

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            console.error("❌ Помилка в UserController.registration():", e);
            next(e);
        }
    }
    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await UserService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true,secure: process.env.NODE_ENV === 'production',  // Виробниче середовище вимагає HTTPS
                sameSite: 'Strict',
                });
            return res.status(200).json(userData);
        } catch (e) { console.log(e)
            next(e);
        }
    }
    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await UserService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }
    async activate(req, res, next) {
        try {
            const activationLink= req.params.link;
            await UserService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            next(e);
        }
    }
    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (!refreshToken) {
                return res.status(401).json({message: "Refresh token not provided"});
            }
            const userData = await UserService.refresh(refreshToken);
            console.log("userData після перевірки токена:", userData);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            console.error("❌ Помилка при оновленні токену:", e);
            next(e);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Помилка при валідації', errors.array()));
            }
            const { email } = req.body;

            const result = await UserService.forgotPassword(email);
            return res.status(200).json(result)
        } catch (e) {
            console.error("❌ Помилка в UserController.forgotPassword():", e);
            return next(e);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            const result = await UserService.resetPassword(token, newPassword);
            return res.json(result);
        } catch (e) {
            console.error("❌ Помилка в UserController.resetPassword():", e);
            return next(e);
        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers()
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();