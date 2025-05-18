"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConvertedPrice = void 0;
const general_1 = require("../types/general");
const getConvertedPrice = (args) => {
    const { currentCurrency, desiredCurrency, price, exchangeRates } = args;
    const MLC_CUP = (exchangeRates === null || exchangeRates === void 0 ? void 0 : exchangeRates.MLC_CUP) || 1;
    const USD_CUP = (exchangeRates === null || exchangeRates === void 0 ? void 0 : exchangeRates.USD_CUP) || 1;
    //////////////////////////////////////////////////////////////////////////
    if (currentCurrency === general_1.Currency.CUP) {
        if (desiredCurrency === general_1.Currency.MLC) {
            return price / MLC_CUP;
        }
        if (desiredCurrency === general_1.Currency.USD) {
            return price / USD_CUP;
        }
    }
    //////////////////////////////////////////////////////////////////////////
    if (currentCurrency === general_1.Currency.MLC) {
        if (desiredCurrency === general_1.Currency.CUP) {
            return price * MLC_CUP;
        }
        if (desiredCurrency === general_1.Currency.USD) {
            return (price * MLC_CUP) / USD_CUP;
        }
    }
    //////////////////////////////////////////////////////////////////////////
    if (currentCurrency === general_1.Currency.USD) {
        if (desiredCurrency === general_1.Currency.CUP) {
            return price * USD_CUP;
        }
        if (desiredCurrency === general_1.Currency.MLC) {
            return (price * USD_CUP) / MLC_CUP;
        }
    }
    return price;
};
exports.getConvertedPrice = getConvertedPrice;
