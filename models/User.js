import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    restoreLink: { type: String },
    dateAuth: { type: Date, default: Date.now },
    dateLogin: { type: Date },
    notes: { type: [String] },
    isSaveSession: { type: Boolean, default: false },
});

export const User = mongoose.model('User', userSchema);