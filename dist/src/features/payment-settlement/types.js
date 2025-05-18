"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSettlementType = exports.PaymentSettlementState = void 0;
var PaymentSettlementState;
(function (PaymentSettlementState) {
    PaymentSettlementState["PENDING"] = "PENDING";
    PaymentSettlementState["DONE"] = "DONE";
})(PaymentSettlementState || (exports.PaymentSettlementState = PaymentSettlementState = {}));
var PaymentSettlementType;
(function (PaymentSettlementType) {
    PaymentSettlementType["TO__BUSINESS_FULL"] = "TO__BUSINESS_FULL";
    PaymentSettlementType["TO__MARKET_FULL"] = "TO__MARKET_FULL";
    PaymentSettlementType["TO__MESSENGER"] = "TO__MESSENGER";
    PaymentSettlementType["FROM__BUSINESS_FULL"] = "FROM__BUSINESS_FULL";
})(PaymentSettlementType || (exports.PaymentSettlementType = PaymentSettlementType = {}));
