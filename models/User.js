import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
    dateLogin: { type: Date },
    isSaveSession: { type: Boolean, default: false },
});

export const User = mongoose.model('User', userSchema);