"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSettlementServices = void 0;
const schemas_1 = require("../../utils/schemas");
const types_1 = require("./types");
const schemas_2 = require("./schemas");
const general_1 = require("../../utils/general");
class PaymentSettlementServices {
    constructor(userServices, businessServices, configServices) {
        this.userServices = userServices;
        this.businessServices = businessServices;
        this.configServices = configServices;
        this.paymentSettlementServicesAddOne = async ({ routeName, messengerId, type, fromDate, toDate, shoppingRecords }) => {
            const PaymentSettlementModel = (0, schemas_2.modelGetter)();
            const out = new PaymentSettlementModel({
                routeName,
                messengerId,
                fromDate,
                toDate,
                type,
                state: types_1.PaymentSettlementState.PENDING,
                shoppingRecords
            });
            await out.save();
            return out;
        };
        this.paymentSettlementServicesGetAllWithPagination = async ({ query, sort, paginateOptions = {} }) => {
            const filterQuery = this.getAllPaymentSettlementFilterQuery(query);
            const PaymentSettlementModel = (0, schemas_2.modelGetter)();
            const out = await PaymentSettlementModel.paginate(filterQuery, {
                ...paginateOptions,
                sort: (0, schemas_1.getSortQuery)(sort)
            });
            return out;
        };
        this.paymentSettlementServicesGetAll = async ({ query, projection }) => {
            const filterQuery = this.getAllPaymentSettlementFilterQuery(query);
            const PaymentSettlementModel = (0, schemas_2.modelGetter)();
            const out = await PaymentSettlementModel.find(filterQuery, projection);
            return out;
        };
        this.paymentSettlementServicesGetOne = async ({ query, projection }) => {
            const PaymentSettlementModel = (0, schemas_2.modelGetter)();
            const out = await PaymentSettlementModel.findOne(query, projection);
            return out;
        };
        this.paymentSettlementServicesDeleteOne = async ({ query }) => {
            const PaymentSettlementModel = (0, schemas_2.modelGetter)();
            const out = await PaymentSettlementModel.findOneAndDelete(query);
            return out;
        };
        this.paymentSettlementServicesChangeToDone = async ({ paymentSettlementId, changedToDoneBy, settlementCode }) => {
            const PaymentSettlementModel = (0, schemas_2.modelGetter)();
            const out = await PaymentSettlementModel.findOneAndUpdate({
                _id: paymentSettlementId
            }, {
                changedToDoneAt: new Date(),
                changedToDoneBy,
                state: types_1.PaymentSettlementState.DONE,
                settlementCode
            }, {
                returnDocument: 'after'
            });
            return out;
        };
        this.getAllPaymentSettlementFilterQuery = (args) => {
            const { paymentIds, states, ...omittedQuery } = args;
            const filterQuery = omittedQuery;
            if (paymentIds === null || paymentIds === void 0 ? void 0 : paymentIds.length) {
                filterQuery.paymentIds = { $in: paymentIds };
            }
            if (states === null || states === void 0 ? void 0 : states.length) {
                filterQuery.state = { $in: states };
            }
            return filterQuery;
        };
        this.getShoppingRecordDto = (shoppingRecord) => {
            const { postsData, shoppingDeliveryAmount = 0 } = shoppingRecord;
            const shoppingPostsAmount = postsData.reduce((acc, { postAmount = 0 }) => acc + postAmount, 0);
            return {
                ...(0, general_1.deepJsonCopy)(shoppingRecord),
                shoppingAmount: shoppingPostsAmount + shoppingDeliveryAmount,
                shoppingPostsAmount
            };
        };
        this.paymentSettlementToDto = async (data) => {
            const adminConfig = await this.configServices.adminConfigServicesGetOne({
                projection: {
                    bankAccountCUP: 1,
                    bankAccountMLC: 1
                }
            });
            const business = await this.businessServices.getAll({
                query: {
                    routeName: (0, schemas_1.getInArrayQuery)((0, general_1.compact)(data.map(({ routeName }) => routeName)))
                },
                projection: {
                    bankAccountCUP: 1,
                    bankAccountMLC: 1,
                    routeName: 1,
                    name: 1
                }
            });
            const messengers = await this.userServices.getAll({
                query: {
                    _id: (0, schemas_1.getInArrayQuery)((0, general_1.compact)(data.map(({ messengerId }) => messengerId)))
                },
                projection: {
                    _id: 1,
                    name: 1,
                    messengerBankAccountCUP: 1
                }
            });
            const getDto = (paymentSettlement) => {
                const { routeName, messengerId, type, shoppingRecords } = paymentSettlement;
                const shoppingRecordsDto = shoppingRecords.map(this.getShoppingRecordDto);
                const amount = shoppingRecordsDto.reduce((acc, { shoppingAmount }) => acc + shoppingAmount, 0);
                const out = {
                    ...(0, general_1.deepJsonCopy)(paymentSettlement),
                    shoppingRecords: shoppingRecordsDto,
                    amount,
                    bankAccountToSettle: undefined,
                    messengerName: undefined,
                    businessName: undefined
                };
                if (routeName) {
                    const theBusiness = business.find((b) => b.routeName === routeName);
                    out.businessName = theBusiness === null || theBusiness === void 0 ? void 0 : theBusiness.name;
                    /**
                     * TODO: In the future the MLC card can be used
                     */
                    if (type === types_1.PaymentSettlementType.FROM__BUSINESS_FULL) {
                        /**
                         * use the market CUP account to make the settlement
                         */
                        out.bankAccountToSettle = adminConfig === null || adminConfig === void 0 ? void 0 : adminConfig.bankAccountCUP;
                    }
                    if (type === types_1.PaymentSettlementType.TO__BUSINESS_FULL ||
                        type === types_1.PaymentSettlementType.TO__MARKET_FULL) {
                        /**
                         * use the business CUP account to make the settlement
                         */
                        out.bankAccountToSettle = theBusiness === null || theBusiness === void 0 ? void 0 : theBusiness.bankAccountCUP;
                    }
                }
                if (messengerId) {
                    const theMessenger = messengers.find((m) => (0, general_1.isEqualIds)(m._id, messengerId));
                    out.messengerName = theMessenger === null || theMessenger === void 0 ? void 0 : theMessenger.name;
                    if (type === types_1.PaymentSettlementType.TO__MESSENGER) {
                        /**
                         * use the messenger CUP account to make the settlement
                         */
                        out.bankAccountToSettle = theMessenger === null || theMessenger === void 0 ? void 0 : theMessenger.messengerBankAccountCUP;
                    }
                }
                ////////////////////////////////////////////////////////////////////
                return out;
            };
            return data.map(getDto);
        };
    }
}
exports.PaymentSettlementServices = PaymentSettlementServices;
