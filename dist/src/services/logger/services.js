"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerServices = void 0;
const winston_1 = require("winston");
require("winston-daily-rotate-file");
class LoggerServices {
    constructor(options) {
        this.logger = (0, winston_1.createLogger)(options);
    }
}
exports.LoggerServices = LoggerServices;
