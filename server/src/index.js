"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var db_1 = require("./config/db");
var authRoutes_js_1 = require("./routes/authRoutes.js");
dotenv_1.default.config();
(0, db_1.default)();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_js_1.default);
app.get('/', function (req, res) {
    res.send('ClipOS API is running');
});
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
