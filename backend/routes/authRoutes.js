"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authController = require("../controllers/authController.js");
var router = (0, express_1.Router)();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.me);
exports.default = router;
