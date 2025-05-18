"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectCoreDB = void 0;
const mongoose_1 = require("mongoose");
const connectCoreDB = async ({ MONGO_DB_URL, logger }) => {
    try {
        await (0, mongoose_1.connect)(MONGO_DB_URL);
        logger.info('DB Connected');
    }
    catch (e) {
        logger.info(`DB Error: ${JSON.stringify(e)}`);
    }
};
exports.connectCoreDB = connectCoreDB;
