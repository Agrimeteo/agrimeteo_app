"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var weatherController = require("../controllers/weatherController.js");
var authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
var router = (0, express_1.Router)();
router.use(authMiddleware_js_1.authMiddleware);
router.get('/', weatherController.getWeather);
exports.default = router;
