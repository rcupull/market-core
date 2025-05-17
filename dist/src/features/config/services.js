"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigServices = void 0;
const schemas_1 = require("./schemas");
const commision_1 = require("../../types/commision");
const general_1 = require("../../utils/general");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const defaultProductsCommissions = {
    marketOperation: {
        mode: commision_1.CommissionMode.PERCENT,
        value: 0
    },
    systemUse: {
        mode: commision_1.CommissionMode.PERCENT,
        value: 0
    }
};
const defaultDeliveryCommissions = {
    marketOperation: {
        mode: commision_1.CommissionMode.PERCENT,
        value: 0
    },
    systemUse: {
        mode: commision_1.CommissionMode.PERCENT,
        value: 0
    }
};
class ConfigServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(businessServices) {
        super(schemas_1.modelGetter);
        this.businessServices = businessServices;
        this.adminConfigServicesGetOne = async ({ projection }) => {
            const out = await this.getOne({
                query: {},
                projection
            });
            return out;
        };
        this.adminConfigServicesUpdateOne = async ({ update }) => {
            await this.updateOne({
                query: {},
                update
            });
        };
        this.adminConfigExangesRatesUtils = async () => {
            const businessData = await this.businessServices.getAll({
                query: {},
                projection: {
                    routeName: 1,
                    businessType: 1,
                    commissions: 1,
                    customCommissions: 1
                }
            });
            const configData = await this.adminConfigServicesGetOne({
                projection: {
                    commissions: 1
                }
            });
            /**
             * Get values dynamically from admin or other place
             */
            return {
                getCommissionsForProduct: (post) => {
                    const { businessType, commissions, customCommissions } = businessData.find((b) => b.routeName === post.routeName) || {};
                    const getDefaultComissions = () => {
                        if (!configData)
                            return {};
                        if (!businessType)
                            return {};
                        return (0, general_1.get)(configData, `commissions.products.${businessType}`) || {};
                    };
                    const getBusinessComissions = () => {
                        return (commissions === null || commissions === void 0 ? void 0 : commissions.products) || {};
                    };
                    const getCommissionObj = customCommissions ? getBusinessComissions : getDefaultComissions;
                    return {
                        commissions: (0, general_1.mergeDeep)(defaultProductsCommissions, (0, general_1.deepJsonCopy)(getCommissionObj()))
                    };
                },
                getCommissionsForDelivery: ({ businessType, routeName }) => {
                    const { commissions, customCommissions } = businessData.find((b) => b.routeName === routeName) || {};
                    const getDefaultComissions = () => {
                        if (!configData)
                            return {};
                        if (!businessType)
                            return {};
                        return (0, general_1.get)(configData, `commissions.delivery.${businessType}`) || {};
                    };
                    const getBusinessComissions = () => {
                        return (commissions === null || commissions === void 0 ? void 0 : commissions.delivery) || {};
                    };
                    const getCommissionObj = customCommissions ? getBusinessComissions : getDefaultComissions;
                    return {
                        commissions: (0, general_1.mergeDeep)(defaultDeliveryCommissions, (0, general_1.deepJsonCopy)(getCommissionObj()))
                    };
                }
            };
        };
        this.adminConfigServicesGetDeliveryConfig = async () => {
            const adminConfig = (await this.adminConfigServicesGetOne({
                projection: {
                    deliveryConfig: 1,
                    addresses: 1
                }
            }));
            const addresses = (adminConfig === null || adminConfig === void 0 ? void 0 : adminConfig.addresses) || [];
            return {
                adminDeliveryConfig: adminConfig === null || adminConfig === void 0 ? void 0 : adminConfig.deliveryConfig,
                /**
                 * The marketplace address to pickup the shopping
                 */
                marketAddress: addresses.length ? addresses[addresses.length - 1] : undefined
            };
        };
        this.features = async () => {
            const adminConfig = (await this.adminConfigServicesGetOne({
                projection: {
                    features: 1
                }
            }));
            return {
                getEnabledFeature: (featureKey) => {
                    var _a, _b, _c;
                    return ((_c = (_b = (_a = adminConfig === null || adminConfig === void 0 ? void 0 : adminConfig.features) === null || _a === void 0 ? void 0 : _a.find((feature) => feature.key === featureKey)) === null || _b === void 0 ? void 0 : _b.enabled) !== null && _c !== void 0 ? _c : false);
                }
            };
        };
    }
}
exports.ConfigServices = ConfigServices;
