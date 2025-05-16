"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async (options) => {
    const { MONGO_DB_URL, loggerInfo } = options;
    try {
        await mongoose_1.default.connect(MONGO_DB_URL);
        loggerInfo('DB Connected');
    }
    catch (e) {
        loggerInfo(`DB Error: ${JSON.stringify(e)}`);
    }
};
exports.connectDB = connectDB;
