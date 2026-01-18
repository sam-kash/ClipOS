"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authController_js_1 = require("../controllers/authController.js");
var router = express_1.default.Router();
router.post('/register', authController_js_1.registerUser);
router.post('/login', authController_js_1.loginUser);
exports.default = router;
