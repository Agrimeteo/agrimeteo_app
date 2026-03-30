"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var morgan_1 = require("morgan");
var dotenv_1 = require("dotenv");
var index_1 = require("./routes/index");
var errorHandler_js_1 = require("./middlewares/errorHandler.js");
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)());
app.use(morgan('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/v1', index_1.default);
app.use(errorHandler_js_1.errorHandler);
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
exports.default = app;
