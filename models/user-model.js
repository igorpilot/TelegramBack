import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    activationLink: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    stores: [{
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        description: String
    }]
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
