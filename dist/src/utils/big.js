"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigRoundUpToTwoDecimals = exports.bigGt = exports.bigEq = void 0;
const big_js_1 = __importDefault(require("big.js"));
/**
 * http://mikemcl.github.io/big.js/
 */
const bigEq = (val1, val2) => {
    const v1 = (0, big_js_1.default)(val1).round(2);
    const v2 = (0, big_js_1.default)(val2).round(2);
    return v1.eq(v2);
};
exports.bigEq = bigEq;
const bigGt = (val1, val2) => {
    const v1 = (0, big_js_1.default)(val1).round(2);
    const v2 = (0, big_js_1.default)(val2).round(2);
    return v1.gt(v2);
};
exports.bigGt = bigGt;
const bigRoundUpToTwoDecimals = (val) => {
    const out = (0, big_js_1.default)(val).round(2, big_js_1.default.roundUp).toString();
    return Number(out);
};
exports.bigRoundUpToTwoDecimals = bigRoundUpToTwoDecimals;
