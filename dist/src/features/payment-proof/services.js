"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProofServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const general_1 = require("../../utils/general");
class PaymentProofServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(configServices, userServices, shoppingServices, paymentServices, options) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.configServices = configServices;
        this.userServices = userServices;
        this.shoppingServices = shoppingServices;
        this.paymentServices = paymentServices;
        this.options = options;
        this.getPaymentProofDataFromShopping = async ({ query }) => {
            const allPaymentsProofs = await this.getAll({
                query,
                projection: {
                    code: 1,
                    _id: 1,
                    shoppingId: 1
                }
            });
            return {
                getOneShoppingPaymentProofData: ({ shoppingId }) => {
                    const paymentProof = allPaymentsProofs.find((paymentProof) => {
                        return (0, general_1.isEqualIds)(paymentProof.shoppingId, shoppingId);
                    });
                    if (!paymentProof) {
                        return null;
                    }
                    return {
                        paymentProofCode: paymentProof.code,
                        paymentProofId: paymentProof._id
                    };
                }
            };
        };
        this.addPaymentProofFromShopping = async (args) => {
            var _a;
            const { shoppingId } = args;
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             *  check if the payment proof exists
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            const exists = await this.exists({
                query: {
                    shoppingId
                }
            });
            if (exists) {
                const { logger } = this.options;
                logger.error('Payment proof exists already');
                return null;
            }
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             *  create payment proof of this shopping
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            const shopping = await this.shoppingServices.getOne({
                query: {
                    _id: shoppingId
                }
            });
            if (!shopping) {
                return null;
            }
            //////////////////////////////////////////////////////////////////////
            const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
                query: {
                    shoppingId
                }
            });
            const { paymentCompleted } = getOneShoppingPaymentData(shopping);
            if (!paymentCompleted) {
                return null;
            }
            //////////////////////////////////////////////////////////////////////
            const config = await this.configServices.adminConfigServicesGetOne({
                projection: {
                    billing: 1
                }
            });
            if (!((_a = config === null || config === void 0 ? void 0 : config.billing) === null || _a === void 0 ? void 0 : _a.name)) {
                const { logger } = this.options;
                logger.info('Missing config data');
                return null;
            }
            //////////////////////////////////////////////////////////////////////
            const userData = await this.userServices.getOne({
                query: {
                    _id: shopping.purchaserId
                }
            });
            if (!userData) {
                return null;
            }
            //////////////////////////////////////////////////////////////////////
            /**
             * create a payment proof
             */
            const paymentProof = await this.addOne({
                customerId: userData._id,
                shoppingId: shopping._id
            });
            return paymentProof;
        };
    }
}
exports.PaymentProofServices = PaymentProofServices;
