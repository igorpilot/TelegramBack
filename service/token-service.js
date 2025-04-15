import jwt from 'jsonwebtoken';
import TokenSchema from '../models/token-model.js';
import crypto from 'crypto';


class TokenService {
    generate() {
        return crypto.randomBytes(32).toString('hex');
    }
generateTokens(user) {
    const payload = {
        id: user._id,
        role: user.role,
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
    const tokenData = await TokenSchema.findOne({user:userId})
    if(tokenData) {
        tokenData.refreshToken = refreshToken
        return tokenData.save()
    }
    const token = await TokenSchema.create({userId, refreshToken})
    return token
}
    async removeToken(refreshToken) {
        try {
            const token = await TokenSchema.findOneAndDelete( refreshToken );
            return token;
        } catch (error) {
            console.error("❌ Помилка при видаленні токену:", error.message);
            throw new Error("Помилка при видаленні токену");
        }
    }
async findToken(refreshToken) {
    const tokenData= await TokenSchema.findOne({refreshToken})
    return tokenData
}
}
export default new TokenService();