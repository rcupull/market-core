"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingServices = void 0;
const schemas_1 = require("./schemas");
const types_1 = require("./types");
const general_1 = require("../../utils/general");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const getShoppingInfo_1 = require("./getShoppingInfo");
const types_2 = require("../business/types");
class ShoppingServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.getShoppingDataFromPosts = async ({ posts }) => {
            /**
             * shopping que tienen estos productos incluidos pero todavia no han sido vendidos. O sea, existen en los almacenes del comerciante
             * El stockAmount de los posts sera decrementado una vez se haya vendido y entregado el producto (cambia para ShoppingState.DELIVERED)*/
            const allShoppings = await this.getAll({
                query: {
                    'posts.postData._id': { $in: posts.map((post) => post._id) },
                    state: {
                        $in: [
                            types_1.ShoppingState.CONSTRUCTION,
                            types_1.ShoppingState.REQUESTED,
                            types_1.ShoppingState.APPROVED,
                            types_1.ShoppingState.READY_TO_DELIVERY
                        ]
                    }
                }
            });
            return {
                getOnePostShoppingData: (post) => {
                    const { stockAmount } = post;
                    const amountInProcess = allShoppings.reduce((acc, shopping) => {
                        let out = acc;
                        shopping.posts.forEach(({ count, postData }) => {
                            if ((0, general_1.isEqualIds)(postData._id, post._id)) {
                                out = out + count;
                            }
                        });
                        return out;
                    }, 0);
                    return {
                        amountInProcess,
                        stockAmount,
                        stockAmountAvailable: stockAmount - amountInProcess
                    };
                }
            };
        };
        /**
         * Return tru if the shopping is or was approved
         */
        this.wasApprovedShopping = (shopping) => {
            const { state, history } = shopping;
            return (state === types_1.ShoppingState.APPROVED ||
                !!(history === null || history === void 0 ? void 0 : history.find(({ state }) => state === types_1.ShoppingState.APPROVED)));
        };
        this.changeShoppingState = (shopping, state, reason) => {
            if (!shopping.history) {
                shopping.history = [];
            }
            shopping.history.push({
                state,
                lastUpdatedDate: new Date(),
                reason
            });
            shopping.state = state;
            return shopping;
        };
        this.changeShoppingAddCancellation = (shopping, user) => {
            shopping.cancellation = {
                requestedAt: new Date(),
                requestedBy: user._id
            };
            return shopping;
        };
        this.getDeliveryPrice = (args) => {
            const { deliveryConfig, distance } = args;
            const { minPrice = 0, priceByKm = 0 } = deliveryConfig;
            if ((0, general_1.isNullOrUndefined)(distance))
                return undefined;
            const { type } = deliveryConfig || {};
            switch (type) {
                case types_2.DeliveryConfigType.OPTIONAL:
                case types_2.DeliveryConfigType.REQUIRED: {
                    return minPrice + priceByKm * distance;
                }
                default: {
                    return 0;
                }
            }
        };
        this.getDeliveryConfigToUse = (args) => {
            const { businessType, adminDeliveryConfig, businessDeliveryConfig } = args;
            if (businessType === types_2.BusinessType.BUSINESS_FULL) {
                return businessDeliveryConfig;
            }
            return adminDeliveryConfig;
        };
        this.getShoppingInfo = (shopping) => (0, getShoppingInfo_1.getShoppingInfo)(shopping);
    }
}
exports.ShoppingServices = ShoppingServices;
