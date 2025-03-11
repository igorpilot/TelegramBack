const userService = require('../service/user-service');
const {validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Помилка при валідації', errors.array()));
            }

            const { email, password, firstName, lastName, phoneNumber } = req.body;

            const userData = await userService.registration(email, password, firstName, lastName, phoneNumber);

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
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true,secure: process.env.NODE_ENV === 'production',  // Виробниче середовище вимагає HTTPS
                sameSite: 'Strict',  // Безпека від CSRF
                });
            return res.json(userData);
        } catch (e) { console.log(e)
            next(e);
        }
    }
    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }
    async activate(req, res, next) {
        try {
            const activationLink= req.params.link;
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            next(e);
        }
    }
    async refresh(req, res, next) {
        try {
            console.log("🔄 Запит на /refresh");
            const {refreshToken} = req.cookies;
            if (!refreshToken) {
                console.log("❌ Відсутній refreshToken");
                return res.status(401).json({message: "Refresh token not provided"});
            }
            const userData = await userService.refresh(refreshToken);
            console.log("userData після перевірки токена:", userData);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            console.error("❌ Помилка при оновленні токену:", e);
            next(e);
        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers()
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();