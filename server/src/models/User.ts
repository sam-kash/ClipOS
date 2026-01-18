import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        // required: true, // Optional if using only OAuth
    },
    googleId: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    credits: {
        type: Number,
        default: 10, // MVP initial credits
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
