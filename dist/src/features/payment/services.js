"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentServices = void 0;
const general_1 = require("../../types/general");
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const general_2 = require("../../utils/general");
const price_1 = require("../../utils/price");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const big_1 = require("../../utils/big");
class PaymentServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(shoppingAppServices) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.shoppingAppServices = shoppingAppServices;
        this.getPaymentDataFromShopping = async ({ query }) => {
            const allPayments = await this.getAll({ query });
            return {
                getOneShoppingPaymentData: (shopping) => {
                    const shoppingAllPayments = (0, general_2.deepJsonCopy)(allPayments).filter((payment) => {
                        return (0, general_2.isEqualIds)(payment.shoppingId, shopping._id);
                    });
                    return {
                        paymentCompleted: (() => {
                            if (!shoppingAllPayments.length) {
                                return false;
                            }
                            const { getPricesForDesiredCurrency } = this.shoppingAppServices.getShoppingInfo(shopping);
                            /**
                             * shoppingSaleTotalPrice is the value of the products in the shopping normalized to CUP.
                             * (Is neccesary normalize a value to compare with the shopping payments)
                             */
                            const shoppingSaleTotalPrice = getPricesForDesiredCurrency(general_1.Currency.CUP).saleTotalPrice;
                            /**
                             * totalAmountPaidInCUP is the acc of the amount in the payments of a shopping normalized to CUP.
                             * (Is neccesary normalize a value to compare with the shopping value of above)
                             */
                            const totalAmountPaidInCUP = shoppingAllPayments.reduce((accumulator, payment) => {
                                const saleTotalPriceInCUP = (0, price_1.getConvertedPrice)({
                                    price: payment.saleTotalPrice,
                                    currentCurrency: payment.currency,
                                    desiredCurrency: general_1.Currency.CUP,
                                    exchangeRates: shopping.exchangeRates
                                });
                                return accumulator + saleTotalPriceInCUP;
                            }, 0);
                            /**
                             * Compare using big library the paid money and the shopping value
                             * if: totalAmountPaidInCUP = shoppingSaleTotalPrice || totalAmountPaidInCUP > shoppingSaleTotalPrice
                             * then: the shopping was paid
                             */
                            const shoppingWasPaid = (0, big_1.bigEq)(totalAmountPaidInCUP, shoppingSaleTotalPrice) ||
                                (0, big_1.bigGt)(totalAmountPaidInCUP, shoppingSaleTotalPrice);
                            const allPaymentAreValidated = shoppingAllPayments.every((p) => p.validation);
                            return shoppingWasPaid && allPaymentAreValidated;
                        })(),
                        paymentHistory: shoppingAllPayments.map(({ _id, paymentWay, validation, currency }) => {
                            return {
                                paymentCurrency: currency,
                                paymentId: _id,
                                hasValidation: !!validation,
                                paymentWay
                            };
                        }),
                        shoppingAllPayments
                    };
                }
            };
        };
        this.changePaymentAddValidation = (payment, user) => {
            payment.validation = {
                createdAt: new Date(),
                createdBy: user._id
            };
            return payment;
        };
    }
}
exports.PaymentServices = PaymentServices;
