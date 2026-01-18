"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.default.Schema({
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
var User = mongoose_1.default.model('User', userSchema);
exports.default = User;
