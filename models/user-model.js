import { Schema, model } from "mongoose";

const userSchema = new Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    firstName: String,
    lastName: String,
    photoUrl: {type: String, default: ""},
    balance: { type: Number, default: 0 },
    hourlyProfit: { type: Number, default: 5 },
    usdt: { type: Number, default: 0 },
    friends: { type:[String] , default: [] },
    completedTasks: {type: [String], default: []},
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    consecutiveLoginDays: { type: Number, default: 1 },
    ticketsUsedToday: { type: Number, default: 0 },
    lastTicketUseDate: { type: Date, default: null },
    lastClaim:{ type: Date, default: null },
    lastDailyReward: { type: Date, default: null },
    lotteries: {
        purchased: [{ type: String, default: [] }],
        received: [{
            id: { type: String, required: true },
            from: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }]
    },
    referralFrom: { type: String, default: null },
}, { timestamps: true });

export default model("User", userSchema);
