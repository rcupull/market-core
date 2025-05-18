"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const general_1 = require("../../utils/general");
class BusinessServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.getBusinessDataFrom = async ({ query }) => {
            const businessData = await this.getAll({
                query,
                projection: {
                    name: 1,
                    routeName: 1,
                    addresses: 1,
                    businessType: 1,
                    currency: 1,
                    deliveryConfig: 1,
                    shoppingMeta: 1,
                    allowedOnlyCUPinCash: 1,
                    customCommissions: 1,
                    commissions: 1
                }
            });
            return {
                getOneBusinessData: ({ routeName }) => {
                    var _a, _b;
                    const oneBusinessData = businessData.find((business) => business.routeName === routeName);
                    return {
                        businessName: oneBusinessData === null || oneBusinessData === void 0 ? void 0 : oneBusinessData.name,
                        businessAllowedOnlyCUPinCash: oneBusinessData === null || oneBusinessData === void 0 ? void 0 : oneBusinessData.allowedOnlyCUPinCash,
                        businessAddress: (_a = oneBusinessData === null || oneBusinessData === void 0 ? void 0 : oneBusinessData.addresses) === null || _a === void 0 ? void 0 : _a[0],
                        businessType: oneBusinessData === null || oneBusinessData === void 0 ? void 0 : oneBusinessData.businessType,
                        businessCurrency: oneBusinessData === null || oneBusinessData === void 0 ? void 0 : oneBusinessData.currency,
                        businessDeliveryConfig: oneBusinessData === null || oneBusinessData === void 0 ? void 0 : oneBusinessData.deliveryConfig,
                        businessTermsAndConditions: (_b = oneBusinessData === null || oneBusinessData === void 0 ? void 0 : oneBusinessData.shoppingMeta) === null || _b === void 0 ? void 0 : _b.termsAndConditions
                    };
                }
            };
        };
        this.getBusinessFavoritesData = async ({ query }) => {
            const businessData = await this.getAll({
                query,
                projection: {
                    name: 1,
                    routeName: 1,
                    favoritesUserIds: 1
                }
            });
            return {
                getFavoritesBusiness: ({ userId }) => {
                    return businessData.reduce((acc, { favoritesUserIds = [], name, routeName }) => {
                        const isFavorite = (0, general_1.includesId)(favoritesUserIds, userId);
                        if (isFavorite) {
                            return [
                                ...acc,
                                {
                                    name,
                                    routeName
                                }
                            ];
                        }
                        return acc;
                    }, []);
                }
            };
        };
    }
}
exports.BusinessServices = BusinessServices;
