"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingDtosServices = void 0;
const general_1 = require("../../utils/general");
const schemas_1 = require("../../utils/schemas");
const types_1 = require("../business/types");
class ShoppingDtosServices {
    constructor(businessServices, userServices, paymentServices, paymentProofServices, configServices, shoppingServices, postServices) {
        this.businessServices = businessServices;
        this.userServices = userServices;
        this.paymentServices = paymentServices;
        this.paymentProofServices = paymentProofServices;
        this.configServices = configServices;
        this.shoppingServices = shoppingServices;
        this.postServices = postServices;
        this.getShoppingsResources = async (shoppings) => {
            const { getOnePurchaserData } = await this.userServices.getPurchasersData({
                query: { _id: { $in: shoppings.map(({ purchaserId }) => purchaserId) } }
            });
            const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
                query: { shoppingId: (0, schemas_1.getInArrayQuery)(shoppings.map(({ _id }) => _id)) }
            });
            const { getOneShoppingPaymentProofData } = await this.paymentProofServices.getPaymentProofDataFromShopping({
                query: { shoppingId: (0, schemas_1.getInArrayQuery)(shoppings.map(({ _id }) => _id)) }
            });
            const { getOneBusinessData } = await this.businessServices.getBusinessDataFrom({
                /**
                 * is the shopping has  routename is of a self managed business, else if managed by the marketplace
                 */
                query: { routeNames: (0, general_1.compact)(shoppings.map(({ routeName }) => routeName)) }
            });
            const { adminDeliveryConfig, marketAddress } = await this.configServices.adminConfigServicesGetDeliveryConfig();
            return {
                getOnePurchaserData,
                getOneShoppingPaymentData,
                getOneShoppingPaymentProofData,
                getOneBusinessData,
                adminDeliveryConfig,
                marketAddress
            };
        };
        this.getShoppingsCartDto = async (shoppings) => {
            const { adminDeliveryConfig, getOneBusinessData } = await this.getShoppingsResources(shoppings);
            /**
             * Searching for all posts
             */
            const allPostsIds = shoppings.map((s) => s.posts.map((p) => p.postData._id)).flat();
            const allShoppingPosts = await this.postServices.getAll({
                query: {
                    _id: (0, schemas_1.getInArrayQuery)(allPostsIds)
                }
            });
            const { getOnePostShoppingData } = await this.shoppingServices.getShoppingDataFromPosts({
                posts: allShoppingPosts
            });
            const getShoppingDto = async (shopping) => {
                const businessData = getOneBusinessData({ routeName: shopping.routeName });
                const out = {
                    ...(0, general_1.deepJsonCopy)(shopping),
                    posts: shopping.posts.map((shoppingPostMeta) => {
                        const { postData, count } = shoppingPostMeta;
                        const post = allShoppingPosts.find((p) => (0, general_1.isEqualIds)(p._id, postData._id));
                        const stockAmountAvailable = post
                            ? getOnePostShoppingData(post).stockAmountAvailable + count
                            : undefined;
                        return {
                            ...(0, general_1.deepJsonCopy)(shoppingPostMeta),
                            stockAmountAvailable
                        };
                    }),
                    ////////////////////////////////////////
                    businessName: businessData === null || businessData === void 0 ? void 0 : businessData.businessName,
                    businessAddress: businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress,
                    businessTermsAndConditions: businessData === null || businessData === void 0 ? void 0 : businessData.businessTermsAndConditions,
                    businessAllowedOnlyCUPinCash: businessData === null || businessData === void 0 ? void 0 : businessData.businessAllowedOnlyCUPinCash,
                    ////////////////////////////////////////
                    deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
                        businessType: shopping.businessType,
                        adminDeliveryConfig,
                        businessDeliveryConfig: businessData === null || businessData === void 0 ? void 0 : businessData.businessDeliveryConfig
                    }),
                    ////////////////////////////////////////
                    addressToPickUp: undefined,
                    ////////////////////////////////////////
                    purchaserName: undefined,
                    purchaserAddress: undefined,
                    purchaserPhone: undefined,
                    ////////////////////////////////////////
                    paymentCompleted: undefined,
                    paymentHistory: [],
                    ////////////////////////////////////////
                    paymentProofCode: undefined,
                    paymentProofId: undefined
                };
                return out;
            };
            const promises = shoppings.map(getShoppingDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getShoppingsPurchaserDto = async (shoppings) => {
            const { adminDeliveryConfig, getOneBusinessData, getOneShoppingPaymentData, getOneShoppingPaymentProofData, getOnePurchaserData, marketAddress } = await this.getShoppingsResources(shoppings);
            const getShoppingDto = async (shopping) => {
                const paymentData = getOneShoppingPaymentData(shopping);
                const businessData = getOneBusinessData({ routeName: shopping.routeName });
                const paymentProofData = getOneShoppingPaymentProofData({ shoppingId: shopping._id });
                const getAddressToPickUp = () => {
                    if (shopping.requestedDelivery) {
                        return undefined;
                    }
                    /**
                     *  has not requestedDelivery
                     */
                    if (shopping.businessType === types_1.BusinessType.MARKET_FULL) {
                        return marketAddress;
                    }
                    return businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress;
                };
                const out = {
                    ...(0, general_1.deepJsonCopy)(shopping),
                    ////////////////////////////////////////
                    businessName: businessData === null || businessData === void 0 ? void 0 : businessData.businessName,
                    businessAddress: businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress,
                    businessTermsAndConditions: businessData === null || businessData === void 0 ? void 0 : businessData.businessTermsAndConditions,
                    businessAllowedOnlyCUPinCash: businessData === null || businessData === void 0 ? void 0 : businessData.businessAllowedOnlyCUPinCash,
                    ////////////////////////////////////////
                    deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
                        businessType: shopping.businessType,
                        adminDeliveryConfig,
                        businessDeliveryConfig: businessData === null || businessData === void 0 ? void 0 : businessData.businessDeliveryConfig
                    }),
                    ////////////////////////////////////////
                    addressToPickUp: getAddressToPickUp(),
                    ////////////////////////////////////////
                    purchaserName: undefined,
                    purchaserAddress: undefined,
                    purchaserPhone: undefined,
                    ////////////////////////////////////////
                    paymentCompleted: paymentData.paymentCompleted,
                    paymentHistory: paymentData.paymentHistory,
                    ////////////////////////////////////////
                    paymentProofCode: paymentProofData === null || paymentProofData === void 0 ? void 0 : paymentProofData.paymentProofCode,
                    paymentProofId: paymentProofData === null || paymentProofData === void 0 ? void 0 : paymentProofData.paymentProofId
                };
                const getShoppingWithPurcherData = (out) => {
                    const purchaserData = getOnePurchaserData({ purchaserId: out.purchaserId });
                    return {
                        ...out,
                        purchaserName: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserName,
                        purchaserAddress: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserAddress,
                        purchaserPhone: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserPhone
                    };
                };
                return this.shoppingServices.wasApprovedShopping(out) ? getShoppingWithPurcherData(out) : out;
            };
            const promises = shoppings.map(getShoppingDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getShoppingsAdminFullDto = async (shoppings) => {
            const { adminDeliveryConfig, getOneBusinessData, getOneShoppingPaymentData, getOneShoppingPaymentProofData, getOnePurchaserData } = await this.getShoppingsResources(shoppings);
            const getShoppingDto = async (shopping) => {
                const paymentData = getOneShoppingPaymentData(shopping);
                const businessData = getOneBusinessData({ routeName: shopping.routeName });
                const purchaserData = getOnePurchaserData({ purchaserId: shopping.purchaserId });
                const paymentProofData = getOneShoppingPaymentProofData({ shoppingId: shopping._id });
                //
                return {
                    ...(0, general_1.deepJsonCopy)(shopping),
                    ////////////////////////////////////////
                    businessName: businessData === null || businessData === void 0 ? void 0 : businessData.businessName,
                    businessAddress: businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress,
                    businessTermsAndConditions: businessData === null || businessData === void 0 ? void 0 : businessData.businessTermsAndConditions,
                    businessAllowedOnlyCUPinCash: businessData === null || businessData === void 0 ? void 0 : businessData.businessAllowedOnlyCUPinCash,
                    ////////////////////////////////////////
                    addressToPickUp: undefined,
                    ////////////////////////////////////////
                    deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
                        businessType: shopping.businessType,
                        adminDeliveryConfig,
                        businessDeliveryConfig: businessData === null || businessData === void 0 ? void 0 : businessData.businessDeliveryConfig
                    }),
                    ////////////////////////////////////////
                    purchaserName: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserName,
                    purchaserAddress: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserAddress,
                    purchaserPhone: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserPhone,
                    ////////////////////////////////////////
                    paymentCompleted: paymentData.paymentCompleted,
                    paymentHistory: paymentData.paymentHistory,
                    ////////////////////////////////////////
                    paymentProofCode: paymentProofData === null || paymentProofData === void 0 ? void 0 : paymentProofData.paymentProofCode,
                    paymentProofId: paymentProofData === null || paymentProofData === void 0 ? void 0 : paymentProofData.paymentProofId
                };
            };
            const promises = shoppings.map(getShoppingDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getShoppingsAdminDeliveryDto = async (shoppings) => {
            const { adminDeliveryConfig, getOneBusinessData, getOneShoppingPaymentData, getOnePurchaserData } = await this.getShoppingsResources(shoppings);
            const getShoppingDto = async (shopping) => {
                const paymentData = getOneShoppingPaymentData(shopping);
                const businessData = getOneBusinessData({ routeName: shopping.routeName });
                const purchaserData = getOnePurchaserData({ purchaserId: shopping.purchaserId });
                return {
                    ...(0, general_1.deepJsonCopy)(shopping),
                    ////////////////////////////////////////
                    businessName: businessData === null || businessData === void 0 ? void 0 : businessData.businessName,
                    businessAddress: businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress,
                    businessTermsAndConditions: businessData === null || businessData === void 0 ? void 0 : businessData.businessTermsAndConditions,
                    businessAllowedOnlyCUPinCash: businessData === null || businessData === void 0 ? void 0 : businessData.businessAllowedOnlyCUPinCash,
                    ////////////////////////////////////////
                    addressToPickUp: undefined,
                    ////////////////////////////////////////
                    deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
                        businessType: shopping.businessType,
                        adminDeliveryConfig,
                        businessDeliveryConfig: businessData === null || businessData === void 0 ? void 0 : businessData.businessDeliveryConfig
                    }),
                    ////////////////////////////////////////
                    purchaserName: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserName,
                    purchaserAddress: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserAddress,
                    purchaserPhone: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserPhone,
                    ////////////////////////////////////////
                    paymentCompleted: paymentData.paymentCompleted,
                    paymentHistory: paymentData.paymentHistory,
                    ////////////////////////////////////////
                    paymentProofCode: undefined,
                    paymentProofId: undefined
                };
            };
            const promises = shoppings.map(getShoppingDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getShoppingsAdminSalesDto = async (shoppings) => {
            const { adminDeliveryConfig, getOneBusinessData, getOneShoppingPaymentData, getOnePurchaserData } = await this.getShoppingsResources(shoppings);
            const getShoppingDto = async (shopping) => {
                const paymentData = getOneShoppingPaymentData(shopping);
                const businessData = getOneBusinessData({ routeName: shopping.routeName });
                const purchaserData = getOnePurchaserData({ purchaserId: shopping.purchaserId });
                const out = {
                    ...(0, general_1.deepJsonCopy)(shopping),
                    ////////////////////////////////////////
                    businessName: businessData === null || businessData === void 0 ? void 0 : businessData.businessName,
                    businessAddress: businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress,
                    businessTermsAndConditions: businessData === null || businessData === void 0 ? void 0 : businessData.businessTermsAndConditions,
                    businessAllowedOnlyCUPinCash: businessData === null || businessData === void 0 ? void 0 : businessData.businessAllowedOnlyCUPinCash,
                    ////////////////////////////////////////
                    deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
                        businessType: shopping.businessType,
                        adminDeliveryConfig,
                        businessDeliveryConfig: businessData === null || businessData === void 0 ? void 0 : businessData.businessDeliveryConfig
                    }),
                    ////////////////////////////////////////
                    addressToPickUp: undefined,
                    ////////////////////////////////////////
                    purchaserName: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserName,
                    purchaserAddress: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserAddress,
                    purchaserPhone: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserPhone,
                    ////////////////////////////////////////
                    paymentCompleted: paymentData.paymentCompleted,
                    paymentHistory: paymentData.paymentHistory,
                    ////////////////////////////////////////
                    paymentProofCode: undefined,
                    paymentProofId: undefined
                };
                return out;
            };
            const promises = shoppings.map(getShoppingDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getShoppingsOwnerDto = async (shoppings) => {
            const { adminDeliveryConfig, getOneBusinessData, getOneShoppingPaymentData, getOnePurchaserData } = await this.getShoppingsResources(shoppings);
            const getShoppingDto = async (shopping) => {
                const paymentData = getOneShoppingPaymentData(shopping);
                const businessData = getOneBusinessData({ routeName: shopping.routeName });
                const out = {
                    ...(0, general_1.deepJsonCopy)(shopping),
                    ////////////////////////////////////////
                    businessName: businessData === null || businessData === void 0 ? void 0 : businessData.businessName,
                    businessAddress: businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress,
                    businessTermsAndConditions: businessData === null || businessData === void 0 ? void 0 : businessData.businessTermsAndConditions,
                    businessAllowedOnlyCUPinCash: businessData === null || businessData === void 0 ? void 0 : businessData.businessAllowedOnlyCUPinCash,
                    ////////////////////////////////////////
                    deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
                        businessType: shopping.businessType,
                        adminDeliveryConfig,
                        businessDeliveryConfig: businessData === null || businessData === void 0 ? void 0 : businessData.businessDeliveryConfig
                    }),
                    ////////////////////////////////////////
                    addressToPickUp: undefined,
                    ////////////////////////////////////////
                    purchaserName: undefined,
                    purchaserAddress: undefined,
                    purchaserPhone: undefined,
                    ////////////////////////////////////////
                    paymentCompleted: paymentData.paymentCompleted,
                    paymentHistory: paymentData.paymentHistory,
                    ////////////////////////////////////////
                    paymentProofCode: undefined,
                    paymentProofId: undefined
                };
                const getShoppingWithPurcherData = (out) => {
                    const purchaserData = getOnePurchaserData({ purchaserId: out.purchaserId });
                    return {
                        ...out,
                        purchaserName: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserName,
                        purchaserAddress: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserAddress,
                        purchaserPhone: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserPhone
                    };
                };
                return this.shoppingServices.wasApprovedShopping(out) ? getShoppingWithPurcherData(out) : out;
            };
            const promises = shoppings.map(getShoppingDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getShoppingsMessengerDto = async (shoppings) => {
            const { adminDeliveryConfig, getOneBusinessData, getOneShoppingPaymentData, getOnePurchaserData } = await this.getShoppingsResources(shoppings);
            const getShoppingDto = async (shopping) => {
                const paymentData = getOneShoppingPaymentData(shopping);
                const businessData = getOneBusinessData({ routeName: shopping.routeName });
                const out = {
                    ...(0, general_1.deepJsonCopy)(shopping),
                    ////////////////////////////////////////
                    businessName: businessData === null || businessData === void 0 ? void 0 : businessData.businessName,
                    businessAddress: businessData === null || businessData === void 0 ? void 0 : businessData.businessAddress,
                    businessTermsAndConditions: businessData === null || businessData === void 0 ? void 0 : businessData.businessTermsAndConditions,
                    businessAllowedOnlyCUPinCash: businessData === null || businessData === void 0 ? void 0 : businessData.businessAllowedOnlyCUPinCash,
                    ////////////////////////////////////////
                    deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
                        businessType: shopping.businessType,
                        adminDeliveryConfig,
                        businessDeliveryConfig: businessData === null || businessData === void 0 ? void 0 : businessData.businessDeliveryConfig
                    }),
                    ////////////////////////////////////////
                    addressToPickUp: undefined,
                    ////////////////////////////////////////
                    purchaserName: undefined,
                    purchaserAddress: undefined,
                    purchaserPhone: undefined,
                    ////////////////////////////////////////
                    paymentCompleted: paymentData.paymentCompleted,
                    paymentHistory: paymentData.paymentHistory,
                    ////////////////////////////////////////
                    paymentProofCode: undefined,
                    paymentProofId: undefined
                };
                const getShoppingWithPurcherData = (out) => {
                    const purchaserData = getOnePurchaserData({ purchaserId: out.purchaserId });
                    return {
                        ...out,
                        purchaserName: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserName,
                        purchaserAddress: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserAddress,
                        purchaserPhone: purchaserData === null || purchaserData === void 0 ? void 0 : purchaserData.purchaserPhone
                    };
                };
                return this.shoppingServices.wasApprovedShopping(out) ? getShoppingWithPurcherData(out) : out;
            };
            const promises = shoppings.map(getShoppingDto);
            const out = await Promise.all(promises);
            return out;
        };
    }
}
exports.ShoppingDtosServices = ShoppingDtosServices;
