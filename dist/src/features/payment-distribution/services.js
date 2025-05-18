"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentDistributionServices = void 0;
const types_1 = require("./types");
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../types/general");
const general_2 = require("../../utils/general");
const types_2 = require("../business/types");
const types_3 = require("../shopping/types");
const types_4 = require("../payment/types");
class PaymentDistributionServices {
    constructor(shoppingServices, paymentServices) {
        this.shoppingServices = shoppingServices;
        this.paymentServices = paymentServices;
        this.getPaymentDistributionData = async (args) => {
            const { business } = args;
            const { businessType } = business;
            /**
             * ////////////////////////////////////////////////////////////////////////
             * ////////////////////////////////////////////////////////////////////////
             * compute money
             * ////////////////////////////////////////////////////////////////////////
             * ////////////////////////////////////////////////////////////////////////
             */
            if (businessType === types_2.BusinessType.BUSINESS_FULL) {
                return await this.getData__BUSINESS_FULL(args);
            }
            if (businessType === types_2.BusinessType.MARKET_FULL) {
                return await this.getData__MARKET_FULL(args);
            }
            /**
             * TODO missing the mareket-delivery business
             */
            return {
                productBusiness: [],
                productMarket: [],
                commisionBusiness: [],
                commisionMarket: [],
                deliveryBusiness: [],
                deliveryMarket: []
            };
        };
        this.getAssociatedShoppings = async (args) => {
            const { business, dateFrom, dateTo } = args;
            const allShopping = await this.shoppingServices.getAll({
                query: (() => {
                    const out = {
                        /**
                         * Filter the shopping DELIVERED in the date range
                         */
                        /**
                         * TODO: falta excluir las que no estan en el rango que se debe pagar.
                         *  Eso deberia tenerse en cuenta en el proceso de facturacion y liquidacion. OJOOO
                         */
                        state: types_3.ShoppingState.DELIVERED,
                        history: {
                            $elemMatch: {
                                state: types_3.ShoppingState.DELIVERED,
                                lastUpdatedDate: {
                                    $gte: dateFrom ? dateFrom.toISOString() : new Date(0).toISOString(),
                                    $lte: dateTo ? dateTo.toISOString() : new Date().toISOString()
                                }
                            }
                        }
                    };
                    if (business) {
                        const { businessType, routeName } = business;
                        switch (businessType) {
                            case types_2.BusinessType.BUSINESS_FULL:
                            case types_2.BusinessType.MARKET_DELIVERY: {
                                out.routeName = routeName;
                                out.businessType = businessType;
                                break;
                            }
                            case types_2.BusinessType.MARKET_FULL: {
                                out.routeName = { $exists: false };
                                out.businessType = { $exists: false };
                                out['posts.postData.routeName'] = routeName;
                                break;
                            }
                        }
                    }
                    return out;
                })()
            });
            return allShopping;
        };
        this.getShoppingResources = async (args) => {
            /**
             * ////////////////////////////////////////////////////////////////////////
             * ////////////////////////////////////////////////////////////////////////
             * Getting shopping
             * ////////////////////////////////////////////////////////////////////////
             * ////////////////////////////////////////////////////////////////////////
             */
            const allShopping = await this.getAssociatedShoppings(args);
            const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
                query: {
                    shoppingId: (0, schemas_1.getInArrayQuery)(allShopping.map(({ _id }) => _id)),
                    validation: { $exists: true }
                }
            });
            const allowedShopping = allShopping.filter((shopping) => {
                const { paymentCompleted } = getOneShoppingPaymentData(shopping);
                return paymentCompleted;
            });
            const allowedPayments = allowedShopping
                .map((shopping) => {
                const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
                return shoppingAllPayments;
            })
                .flat();
            return {
                allowedPayments,
                allowedShopping,
                getOneShoppingPaymentData
            };
        };
        this.getData__BUSINESS_FULL = async (args) => {
            const { allowedShopping, getOneShoppingPaymentData } = await this.getShoppingResources(args);
            /**
             * //////////////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////////////
             */
            const getDataProduct = (args) => {
                const { currency, paymentWays, shopping } = args;
                const { posts } = shopping;
                const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
                const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);
                const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos
                if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay))
                    return;
                const { getProductPrices } = getPricesForDesiredCurrency(currency);
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                const deliveryAmount = 0;
                return {
                    deliveryAmount,
                    postsData: posts.map(({ count, postData }) => {
                        const { productPrice, marketOperationProductPrice } = getProductPrices(postData);
                        /**
                         * //////////////////////////////////////////////////////////////////////////////
                         * //////////////////////////////////////////////////////////////////////////////
                         * el precio del producto y las operaciones de venta van a cargo del business
                         * //////////////////////////////////////////////////////////////////////////////
                         * //////////////////////////////////////////////////////////////////////////////
                         */
                        const postAmount = count * (productPrice + marketOperationProductPrice);
                        return {
                            postId: postData._id,
                            postName: postData.name,
                            postAmount
                        };
                    })
                };
            };
            const get_productBusiness = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: getDataProduct({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.CASH],
                            shopping
                        }),
                        [types_1.DistributionCurrency.CUP_TRAN]: undefined,
                        [types_1.DistributionCurrency.MLC]: undefined,
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            const get_productMarket = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: undefined,
                        [types_1.DistributionCurrency.CUP_TRAN]: getDataProduct({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.MLC]: getDataProduct({
                            currency: general_1.Currency.MLC,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            /**
             * //////////////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////////////
             */
            const getDataCommision = (args) => {
                const { currency, paymentWays, shopping } = args;
                const { posts } = shopping;
                const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
                const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);
                const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos
                if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay))
                    return;
                const { systemUseDeliveryPrice, getProductPrices } = getPricesForDesiredCurrency(currency);
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 * la comission por el uso del sistema para entregar el producto es el valor de la comision
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                const deliveryAmount = systemUseDeliveryPrice;
                return {
                    deliveryAmount,
                    postsData: posts.map(({ count, postData }) => {
                        const { systemUseProductPrice } = getProductPrices(postData);
                        /**
                         * //////////////////////////////////////////////////////////////////////////////
                         * //////////////////////////////////////////////////////////////////////////////
                         * la comission por el uso del sistema para vender el producto es el valor de la comision
                         * //////////////////////////////////////////////////////////////////////////////
                         * //////////////////////////////////////////////////////////////////////////////
                         */
                        const postAmount = count * systemUseProductPrice;
                        return {
                            postId: postData._id,
                            postName: postData.name,
                            postAmount
                        };
                    })
                };
            };
            const get_commisionBusiness = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: getDataCommision({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.CASH],
                            shopping
                        }),
                        [types_1.DistributionCurrency.CUP_TRAN]: undefined,
                        [types_1.DistributionCurrency.MLC]: undefined,
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            const get_commisionMarket = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: undefined,
                        [types_1.DistributionCurrency.CUP_TRAN]: getDataCommision({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.MLC]: getDataCommision({
                            currency: general_1.Currency.MLC,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            /**
             * //////////////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////////////
             */
            const getDataDelivery = (args) => {
                const { currency, paymentWays, shopping } = args;
                const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
                const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);
                const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos
                if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay))
                    return;
                const { deliveryPrice, marketOperationDeliveryPrice } = getPricesForDesiredCurrency(currency);
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 * la comission por el uso del sistema para entregar el producto es el valor de la comision
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                const deliveryAmount = deliveryPrice + marketOperationDeliveryPrice;
                return {
                    deliveryAmount,
                    postsData: []
                };
            };
            const get_deliveryBusiness = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: getDataDelivery({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.CASH],
                            shopping
                        }),
                        [types_1.DistributionCurrency.CUP_TRAN]: undefined,
                        [types_1.DistributionCurrency.MLC]: undefined,
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            const get_deliveryMarket = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: undefined,
                        [types_1.DistributionCurrency.CUP_TRAN]: getDataDelivery({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.MLC]: getDataDelivery({
                            currency: general_1.Currency.MLC,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            return {
                productBusiness: get_productBusiness(),
                productMarket: get_productMarket(),
                commisionBusiness: get_commisionBusiness(),
                commisionMarket: get_commisionMarket(),
                deliveryBusiness: get_deliveryBusiness(),
                deliveryMarket: get_deliveryMarket()
            };
        };
        this.howManyBusinessAreInShoppingPosts = (shopping) => {
            let routeNames = [];
            shopping.posts.forEach(({ postData }) => {
                routeNames = (0, general_2.addStringToUniqueArray)(routeNames, postData.routeName);
            });
            return routeNames.length;
        };
        this.getData__MARKET_FULL = async (args) => {
            const { allowedShopping, getOneShoppingPaymentData } = await this.getShoppingResources(args);
            const { business } = args;
            /**
             * //////////////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////////////
             */
            const getDataProduct = (args) => {
                const { currency, paymentWays, shopping } = args;
                const { posts } = shopping;
                const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
                const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);
                const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos
                if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay))
                    return;
                const { getProductPrices } = getPricesForDesiredCurrency(currency);
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                const deliveryAmount = 0;
                return {
                    deliveryAmount,
                    postsData: (0, general_2.compact)(posts.map(({ count, postData }) => {
                        if (business.routeName !== postData.routeName)
                            return;
                        const { productPrice } = getProductPrices(postData);
                        /**
                         * //////////////////////////////////////////////////////////////////////////////
                         * //////////////////////////////////////////////////////////////////////////////
                         */
                        const postAmount = count * productPrice;
                        return {
                            postId: postData._id,
                            postName: postData.name,
                            postAmount
                        };
                    }))
                };
            };
            const get_productMarket = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: getDataProduct({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.CASH],
                            shopping
                        }),
                        [types_1.DistributionCurrency.CUP_TRAN]: getDataProduct({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.TRANSFERMOVIL, types_4.PaymentWay.ENZONA],
                            shopping
                        }),
                        [types_1.DistributionCurrency.MLC]: getDataProduct({
                            currency: general_1.Currency.MLC,
                            paymentWays: [types_4.PaymentWay.TRANSFERMOVIL, types_4.PaymentWay.ENZONA],
                            shopping
                        }),
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            const get_productBusiness = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: undefined,
                        [types_1.DistributionCurrency.CUP_TRAN]: undefined,
                        [types_1.DistributionCurrency.MLC]: undefined,
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            /**
             * //////////////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////////////
             */
            const getDataCommision = (args) => {
                const { currency, paymentWays, shopping } = args;
                const { posts } = shopping;
                const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
                const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);
                const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos
                if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay))
                    return;
                const { getProductPrices } = getPricesForDesiredCurrency(currency);
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                const deliveryAmount = 0;
                return {
                    deliveryAmount,
                    postsData: (0, general_2.compact)(posts.map(({ count, postData }) => {
                        if (business.routeName !== postData.routeName)
                            return;
                        const { systemUseProductPrice, marketOperationProductPrice } = getProductPrices(postData);
                        /**
                         * //////////////////////////////////////////////////////////////////////////////
                         * //////////////////////////////////////////////////////////////////////////////
                         */
                        const postAmount = count * (systemUseProductPrice + marketOperationProductPrice);
                        return {
                            postId: postData._id,
                            postName: postData.name,
                            postAmount
                        };
                    }))
                };
            };
            const get_commisionMarket = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: getDataCommision({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.CASH],
                            shopping
                        }),
                        [types_1.DistributionCurrency.CUP_TRAN]: getDataCommision({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.TRANSFERMOVIL, types_4.PaymentWay.ENZONA],
                            shopping
                        }),
                        [types_1.DistributionCurrency.MLC]: getDataCommision({
                            currency: general_1.Currency.MLC,
                            paymentWays: [types_4.PaymentWay.TRANSFERMOVIL, types_4.PaymentWay.ENZONA],
                            shopping
                        }),
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            const get_commisionBusiness = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: undefined,
                        [types_1.DistributionCurrency.CUP_TRAN]: undefined,
                        [types_1.DistributionCurrency.MLC]: undefined,
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            /**
             * //////////////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////////////
             */
            const getDataDelivery = (args) => {
                const { currency, paymentWays, shopping } = args;
                const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
                const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);
                const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos
                if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay))
                    return;
                const { saleDeliveryPrice } = getPricesForDesiredCurrency(currency);
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 * la comission por el uso del sistema para entregar el producto es el valor de la comision
                 * //////////////////////////////////////////////////////////////////////////////
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                const businessCount = this.howManyBusinessAreInShoppingPosts(shopping);
                const deliveryAmount = saleDeliveryPrice / businessCount;
                return {
                    deliveryAmount,
                    postsData: []
                };
            };
            const get_deliveryMarket = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: getDataDelivery({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.CASH],
                            shopping
                        }),
                        [types_1.DistributionCurrency.CUP_TRAN]: getDataDelivery({
                            currency: general_1.Currency.CUP,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.MLC]: getDataDelivery({
                            currency: general_1.Currency.MLC,
                            paymentWays: [types_4.PaymentWay.ENZONA, types_4.PaymentWay.TRANSFERMOVIL],
                            shopping
                        }),
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            const get_deliveryBusiness = () => {
                return allowedShopping.reduce((acc, shopping) => {
                    const { _id, code } = shopping;
                    const shoppingData = {
                        shoppingCode: code,
                        shoppingId: _id,
                        [types_1.DistributionCurrency.CUP_CASH]: undefined,
                        [types_1.DistributionCurrency.CUP_TRAN]: undefined,
                        [types_1.DistributionCurrency.MLC]: undefined,
                        [types_1.DistributionCurrency.USD]: undefined
                    };
                    return [...acc, shoppingData];
                }, []);
            };
            return {
                productBusiness: get_productBusiness(),
                productMarket: get_productMarket(),
                commisionBusiness: get_commisionBusiness(),
                commisionMarket: get_commisionMarket(),
                deliveryBusiness: get_deliveryBusiness(),
                deliveryMarket: get_deliveryMarket()
            };
        };
        this.getTotalAmount = (allShoppingDistrubutions) => {
            return allShoppingDistrubutions.reduce((acc, shoppingDistribution) => {
                const out = { ...acc };
                Object.values(types_1.DistributionCurrency).forEach((distributionCurrency) => {
                    const value = shoppingDistribution[distributionCurrency];
                    if (value) {
                        out[distributionCurrency] =
                            out[distributionCurrency] +
                                value.deliveryAmount +
                                value.postsData.reduce((acc2, { postAmount }) => acc2 + postAmount, 0);
                    }
                });
                return out;
            }, {
                [types_1.DistributionCurrency.CUP_CASH]: 0,
                [types_1.DistributionCurrency.CUP_TRAN]: 0,
                [types_1.DistributionCurrency.MLC]: 0,
                [types_1.DistributionCurrency.USD]: 0
            });
        };
        this.getTotalAmountFromOne = ({ deliveryAmount, postsData }) => {
            return deliveryAmount + postsData.reduce((acc2, { postAmount }) => acc2 + postAmount, 0);
        };
    }
}
exports.PaymentDistributionServices = PaymentDistributionServices;
