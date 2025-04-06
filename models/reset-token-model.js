import mongoose from 'mongoose';

const ResetTokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: true },
    expiryDate: { type: Date, required: true },
});

const ResetTokenModel = mongoose.model('ResetToken', ResetTokenSchema);
export default ResetTokenModel;