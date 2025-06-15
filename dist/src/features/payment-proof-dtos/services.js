"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProofDtosServices = void 0;
const general_1 = require("../../utils/general");
const schemas_1 = require("../../utils/schemas");
class PaymentProofDtosServices {
    constructor(userServices, paymentServices, configServices, shoppingServices) {
        this.userServices = userServices;
        this.paymentServices = paymentServices;
        this.configServices = configServices;
        this.shoppingServices = shoppingServices;
        this.getPaymentProofsDto = async (paymentProofs) => {
            //////////////////////////////////////////////////////////////////////
            const allShopping = await this.shoppingServices.getAll({
                query: {
                    _id: (0, schemas_1.getInArrayQuery)(paymentProofs.map((p) => p.shoppingId))
                }
            });
            //////////////////////////////////////////////////////////////////////
            const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
                query: {
                    shoppingId: (0, schemas_1.getInArrayQuery)(paymentProofs.map((p) => p.shoppingId))
                }
            });
            //////////////////////////////////////////////////////////////////////
            const config = await this.configServices.adminConfigServicesGetOne({
                projection: {
                    billing: 1
                }
            });
            //////////////////////////////////////////////////////////////////////
            const customers = await this.userServices.getAll({
                query: {
                    _id: (0, schemas_1.getInArrayQuery)(paymentProofs.map((p) => p.customerId))
                }
            });
            //////////////////////////////////////////////////////////////////////
            const getDto = (paymentProof) => {
                var _a, _b, _c;
                const customer = customers.find((c) => (0, general_1.isEqualIds)(c._id, paymentProof.customerId));
                const shopping = allShopping.find((s) => (0, general_1.isEqualIds)(s._id, paymentProof.shoppingId));
                const shoppingAllPayments = shopping && ((_a = getOneShoppingPaymentData(shopping)) === null || _a === void 0 ? void 0 : _a.shoppingAllPayments);
                return {
                    ...(0, general_1.deepJsonCopy)(paymentProof),
                    sellerName: (_b = config === null || config === void 0 ? void 0 : config.billing) === null || _b === void 0 ? void 0 : _b.name,
                    sellerEmail: 'comercial@eltrapichecubiche.com',
                    sellerPhone: '+53 5020 5971',
                    //
                    customerName: customer === null || customer === void 0 ? void 0 : customer.name,
                    customerPhone: customer === null || customer === void 0 ? void 0 : customer.phone,
                    customerAddress: (_c = customer === null || customer === void 0 ? void 0 : customer.addresses) === null || _c === void 0 ? void 0 : _c[0],
                    //
                    shoppingCode: shopping === null || shopping === void 0 ? void 0 : shopping.code,
                    shoppingProducts: ((shopping === null || shopping === void 0 ? void 0 : shopping.posts) || []).map(({ postData, count }) => ({
                        productName: postData.name,
                        productId: postData._id,
                        amount: count
                    })),
                    paymentsInfo: (shoppingAllPayments || []).map((payment) => ({
                        createdAt: payment.createdAt,
                        paymentId: payment._id,
                        paymentWay: payment.paymentWay,
                        amount: payment.saleTotalPrice,
                        currency: payment.currency
                    }))
                };
            };
            return paymentProofs.map(getDto);
        };
    }
}
exports.PaymentProofDtosServices = PaymentProofDtosServices;
