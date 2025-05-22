
import { Schema, model } from "mongoose";

const userSchema = new Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    firstName: String,
    lastName: String,
    photoUrl: String,
    balance: { type: Number, default: 0 },
    hourlyProfit: { type: Number, default: 5 },
    usdt: { type: Number, default: 0 },
    friends: { type:[String] , default: [] },
    level: { type: Number, default: 1 },
    lastActiveAt: { type: Date, default: Date.now },
    lastClaim:{ type: Date, default: null },
    lastDailyReward: { type: Date, default: null },
    history: [{
        action: String,
        amount: Number,
        date: Date
    }],
    referralFrom: { type: String, default: null },
}, { timestamps: true });

export default model("User", userSchema);
