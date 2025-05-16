"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoose = exports.injectMongoose = void 0;
let sharedMongoose;
const injectMongoose = (m) => {
    sharedMongoose = m;
};
exports.injectMongoose = injectMongoose;
const getMongoose = () => {
    if (!sharedMongoose) {
        throw new Error('Mongoose not injected');
    }
    return sharedMongoose;
};
exports.getMongoose = getMongoose;
