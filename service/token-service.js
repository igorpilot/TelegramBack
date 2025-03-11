const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
generateTokens(user) {
    const payload = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
    };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN});
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN});
    return {accessToken, refreshToken};
}
validateAccessToken(token) {
    try {
        const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        return userData;
    } catch (e) {
        return null
    }
}
validateRefreshToken(token) {
    try {
        const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        return userData;
    } catch (e) {
        return null
    }
}
async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({user:userId})
    if(tokenData) {
        tokenData.refreshToken = refreshToken
        return tokenData.save()
    }
    const token = await tokenModel.create({userId, refreshToken})
    return token
}
    async removeToken(refreshToken) {
        try {
            const token = await tokenModel.findOneAndDelete( refreshToken );
            return token;
        } catch (error) {
            console.error("❌ Помилка при видаленні токену:", error.message);
            throw new Error("Помилка при видаленні токену");
        }
    }
async findToken(refreshToken) {
    const tokenData= await tokenModel.findOne({refreshToken})
    return tokenData
}
}

module.exports = new TokenService();