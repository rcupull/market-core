"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const general_1 = require("../../types/general");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const types_1 = require("../payment/types");
class BillServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(configServices, businessServices, paymentDistributionServices, options) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.configServices = configServices;
        this.businessServices = businessServices;
        this.paymentDistributionServices = paymentDistributionServices;
        this.options = options;
        this.getConfigData = async () => {
            /**
             * ////////////////////////////////////////////////////////////////////////////////////
             * ////////////////////////////////////////////////////////////////////////////////////
             * ////////////////////////////////////////////////////////////////////////////////////
             */
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const config = await this.configServices.adminConfigServicesGetOne({
                projection: {
                    billing: 1
                }
            });
            if (!((_a = config === null || config === void 0 ? void 0 : config.billing) === null || _a === void 0 ? void 0 : _a.accountNumber) ||
                !((_b = config === null || config === void 0 ? void 0 : config.billing) === null || _b === void 0 ? void 0 : _b.bankNumber) ||
                !((_c = config === null || config === void 0 ? void 0 : config.billing) === null || _c === void 0 ? void 0 : _c.nit) ||
                !((_d = config === null || config === void 0 ? void 0 : config.billing) === null || _d === void 0 ? void 0 : _d.name) ||
                !((_e = config === null || config === void 0 ? void 0 : config.billing) === null || _e === void 0 ? void 0 : _e.address)) {
                /**
                 * send message or something to check when this happen
                 */
                const { logger } = this.options;
                logger.error('Billing config not found');
                return null;
            }
            const out = {
                sellerAccountNumber: (_f = config.billing) === null || _f === void 0 ? void 0 : _f.accountNumber,
                sellerBankNumber: (_g = config.billing) === null || _g === void 0 ? void 0 : _g.bankNumber,
                sellerNit: (_h = config.billing) === null || _h === void 0 ? void 0 : _h.nit,
                sellerName: (_j = config.billing) === null || _j === void 0 ? void 0 : _j.name,
                sellerAddress: (_k = config.billing) === null || _k === void 0 ? void 0 : _k.address,
                sellerEmail: 'TODO'
            };
            return out;
        };
        this.getBusinessData = async ({ routeName }) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const business = await this.businessServices.getOne({
                query: {
                    routeName
                },
                projection: {
                    billing: 1
                }
            });
            if (!((_a = business === null || business === void 0 ? void 0 : business.billing) === null || _a === void 0 ? void 0 : _a.accountNumber) ||
                !((_b = business === null || business === void 0 ? void 0 : business.billing) === null || _b === void 0 ? void 0 : _b.bankNumber) ||
                !((_c = business === null || business === void 0 ? void 0 : business.billing) === null || _c === void 0 ? void 0 : _c.nit) ||
                !((_d = business === null || business === void 0 ? void 0 : business.billing) === null || _d === void 0 ? void 0 : _d.name) ||
                !((_e = business === null || business === void 0 ? void 0 : business.billing) === null || _e === void 0 ? void 0 : _e.address)) {
                const { logger } = this.options;
                logger.error('Billing config not found');
                return null;
            }
            const out = {
                customerAccountNumber: (_f = business.billing) === null || _f === void 0 ? void 0 : _f.accountNumber,
                customerBankNumber: (_g = business.billing) === null || _g === void 0 ? void 0 : _g.bankNumber,
                customerNit: (_h = business.billing) === null || _h === void 0 ? void 0 : _h.nit,
                customerName: (_j = business.billing) === null || _j === void 0 ? void 0 : _j.name,
                customerAddress: (_k = business.billing) === null || _k === void 0 ? void 0 : _k.address,
                customerIdentityNumber: (_l = business.billing) === null || _l === void 0 ? void 0 : _l.identityNumber
            };
            return out;
        };
        this.getDistrubutionData = async (args) => {
            const { dateFrom, dateTo, routeName } = args;
            const business = await this.businessServices.getOne({
                query: {
                    routeName
                }
            });
            if (!business) {
                const { logger } = this.options;
                logger.error('Business not found');
                return null;
            }
            const { commisionBusiness, commisionMarket } = await this.paymentDistributionServices.getPaymentDistributionData({
                business,
                dateFrom,
                dateTo
            });
            const allDistrubutions = [...commisionBusiness, ...commisionMarket];
            const totalAmount = this.paymentDistributionServices.getTotalAmount(allDistrubutions);
            return {
                dataFromCUP: (() => {
                    if (!totalAmount.CUP_CASH && !totalAmount.CUP_TRAN) {
                        return null;
                    }
                    return {
                        totalAmount: totalAmount.CUP_CASH + totalAmount.CUP_TRAN,
                        detailedAmount: allDistrubutions.reduce((acc, args) => {
                            const { shoppingCode, shoppingId, CUP_CASH, CUP_TRAN } = args;
                            if (CUP_CASH || CUP_TRAN) {
                                const item = {
                                    shoppingCode,
                                    shoppingId,
                                    amount: (() => {
                                        let out = 0;
                                        if (CUP_CASH) {
                                            out = out + this.paymentDistributionServices.getTotalAmountFromOne(CUP_CASH);
                                        }
                                        if (CUP_TRAN) {
                                            out = out + this.paymentDistributionServices.getTotalAmountFromOne(CUP_TRAN);
                                        }
                                        return out;
                                    })()
                                };
                                return [...acc, item];
                            }
                            return acc;
                        }, [])
                    };
                })(),
                dataFromMLC: (() => {
                    if (!totalAmount.MLC) {
                        return null;
                    }
                    return {
                        totalAmount: totalAmount.MLC,
                        detailedAmount: allDistrubutions.reduce((acc, args) => {
                            const { shoppingCode, shoppingId, MLC } = args;
                            if (MLC) {
                                const item = {
                                    shoppingCode,
                                    shoppingId,
                                    amount: this.paymentDistributionServices.getTotalAmountFromOne(MLC)
                                };
                                return [...acc, item];
                            }
                            return acc;
                        }, [])
                    };
                })()
            };
        };
        this.billGenerateForSaleService = async (args) => {
            const { dateFrom, dateTo, routeName } = args;
            const sellerData = await this.getConfigData();
            const customerData = await this.getBusinessData({ routeName });
            const distributionData = await this.getDistrubutionData({ routeName, dateFrom, dateTo });
            const latestBillFromBusiness = await this.getLatest({ query: { routeName } });
            const { logger } = this.options;
            if (!sellerData) {
                logger.error('sellerData no found');
                return;
            }
            if (!customerData) {
                logger.error('customerData no found');
                return;
            }
            if (!distributionData) {
                logger.error('distributionData no found');
                return;
            }
            const { dataFromCUP, dataFromMLC } = distributionData;
            let billNumber = latestBillFromBusiness ? latestBillFromBusiness.number + 1 : 0;
            const { customerAccountNumber, customerBankNumber, customerIdentityNumber, customerName, customerNit, customerAddress } = customerData;
            const { sellerAccountNumber, sellerBankNumber, sellerEmail, sellerName, sellerNit, sellerAddress } = sellerData;
            if (dataFromCUP) {
                const { detailedAmount, totalAmount } = dataFromCUP;
                await this.addOne({
                    customerAccountNumber,
                    customerBankNumber,
                    customerIdentityNumber,
                    customerName,
                    customerNit,
                    customerAddress,
                    //
                    sellerAccountNumber,
                    sellerBankNumber,
                    sellerEmail,
                    sellerName,
                    sellerNit,
                    sellerAddress,
                    //
                    concepts: [], //TODO
                    number: billNumber,
                    currency: general_1.Currency.CUP,
                    paymentWay: types_1.PaymentWay.TRANSFERMOVIL,
                    routeName,
                    totalAmount,
                    detailedAmount,
                    dateFrom,
                    dateTo
                });
                billNumber++;
            }
            if (dataFromMLC) {
                const { detailedAmount, totalAmount } = dataFromMLC;
                await this.addOne({
                    customerAccountNumber,
                    customerBankNumber,
                    customerIdentityNumber,
                    customerName,
                    customerNit,
                    customerAddress,
                    //
                    sellerAccountNumber,
                    sellerBankNumber,
                    sellerEmail,
                    sellerName,
                    sellerNit,
                    sellerAddress,
                    //
                    concepts: [], //TODO
                    number: billNumber,
                    currency: general_1.Currency.MLC,
                    paymentWay: types_1.PaymentWay.TRANSFERMOVIL,
                    routeName,
                    totalAmount,
                    detailedAmount,
                    dateFrom,
                    dateTo
                });
            }
        };
    }
}
exports.BillServices = BillServices;
