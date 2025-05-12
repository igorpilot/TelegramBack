
import { Schema, model } from "mongoose";

const userSchema = new Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    firstName: String,
    lastName: String,
    photoUrl: String,

    balance: { type: Number, default: 0 },
    usdt: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastActiveAt: { type: Date, default: Date.now },

    history: [{
        action: String,
        amount: Number,
        date: Date
    }],
}, { timestamps: true });

export default model("User", userSchema);
