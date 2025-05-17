"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostFormField = exports.BusinessType = exports.DeliveryConfigType = exports.BusinessNotificationFlags = void 0;
var BusinessNotificationFlags;
(function (BusinessNotificationFlags) {
    BusinessNotificationFlags["NEW_SHOPPING"] = "NEW_SHOPPING";
})(BusinessNotificationFlags || (exports.BusinessNotificationFlags = BusinessNotificationFlags = {}));
var DeliveryConfigType;
(function (DeliveryConfigType) {
    DeliveryConfigType["NONE"] = "NONE";
    DeliveryConfigType["FREE"] = "FREE";
    DeliveryConfigType["REQUIRED"] = "REQUIRED";
    DeliveryConfigType["OPTIONAL"] = "OPTIONAL";
})(DeliveryConfigType || (exports.DeliveryConfigType = DeliveryConfigType = {}));
var BusinessType;
(function (BusinessType) {
    /**
     * The busines controla y maneja todo los recursos de ventas y delivery
     * Solo utiliza la plataforma para darle visibilidad a los productos
     */
    BusinessType["BUSINESS_FULL"] = "BUSINESS_FULL";
    /**
     * El business no controla nada de la plataforma, es un proveedor que solo
     * nos entrega su mercancia y el marketplace gestiona todo
     * : Stock, shopping y delivery
     */
    BusinessType["MARKET_FULL"] = "MARKET_FULL";
    /**
     * El business controla el stock y las ventas y nos encarga la gestion del delivery
     */
    BusinessType["MARKET_DELIVERY"] = "MARKET_DELIVERY";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
var PostFormField;
(function (PostFormField) {
    /**
     * optional fields of the new product form
     */
    PostFormField["CLOTHING_SIZES"] = "CLOTHING_SIZES";
    PostFormField["COLORS"] = "COLORS";
    PostFormField["DETAILS"] = "DETAILS";
    PostFormField["DISCOUNT"] = "DISCOUNT";
})(PostFormField || (exports.PostFormField = PostFormField = {}));
