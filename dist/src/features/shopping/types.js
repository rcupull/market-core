"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingDeliveryState = exports.ShoppingState = void 0;
var ShoppingState;
(function (ShoppingState) {
    ShoppingState["CONSTRUCTION"] = "CONSTRUCTION";
    ShoppingState["REQUESTED"] = "REQUESTED";
    ShoppingState["APPROVED"] = "APPROVED";
    ShoppingState["READY_TO_DELIVERY"] = "READY_TO_DELIVERY";
    ShoppingState["DELIVERED"] = "DELIVERED";
    ShoppingState["CANCELED"] = "CANCELED";
    ShoppingState["REJECTED"] = "REJECTED";
})(ShoppingState || (exports.ShoppingState = ShoppingState = {}));
var ShoppingDeliveryState;
(function (ShoppingDeliveryState) {
    ShoppingDeliveryState["NOT_ASSIGNED"] = "NOT_ASSIGNED";
    ShoppingDeliveryState["NOT_STARTED"] = "NOT_STARTED";
    ShoppingDeliveryState["IN_PROGRESS"] = "IN_PROGRESS";
    ShoppingDeliveryState["FINISHED"] = "FINISHED";
})(ShoppingDeliveryState || (exports.ShoppingDeliveryState = ShoppingDeliveryState = {}));
