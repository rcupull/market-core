"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DtosServices = void 0;
const general_1 = require("../../utils/general");
const schemas_1 = require("../../utils/schemas");
const types_1 = require("../auth/types");
const types_2 = require("../business/types");
const types_3 = require("../search/types");
class DtosServices {
    constructor(businessServices, authServices, userServices, paymentServices, paymentProofServices, configServices, shoppingServices, postServices, helperServices) {
        this.businessServices = businessServices;
        this.authServices = authServices;
        this.userServices = userServices;
        this.paymentServices = paymentServices;
        this.paymentProofServices = paymentProofServices;
        this.configServices = configServices;
        this.shoppingServices = shoppingServices;
        this.postServices = postServices;
        this.helperServices = helperServices;
        /**
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         * ///////////////////////PAYMENT PROOF//////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         */
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
        /**
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////USERS///////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         */
        this.getUsersDto = async (users) => {
            const { getFavoritesBusiness } = await this.businessServices.getBusinessFavoritesData({
                query: {
                    favoritesUserIds: (0, schemas_1.getInArrayQuery)(users.map((user) => user._id))
                }
            });
            const getDto = async (user) => {
                const out = {
                    ...(0, general_1.deepJsonCopy)(user),
                    favoritesBusiness: getFavoritesBusiness({ userId: user._id }),
                    hasOpenSession: false,
                    lastAccessAt: undefined
                };
                const lastSession = await this.authServices.getOne({
                    query: { userId: user._id },
                    sort: schemas_1.lastUpQuerySort
                });
                if (!lastSession) {
                    return out;
                }
                const refreshHistory = lastSession.refreshHistory;
                const lastAccessAt = refreshHistory[refreshHistory.length - 1];
                out.hasOpenSession = lastSession.state === types_1.AuthSessionState.OPEN;
                out.lastAccessAt = lastAccessAt || lastSession.createdAt;
                return out;
            };
            const promises = users.map(getDto);
            const out = await Promise.all(promises);
            return out;
        };
        /**
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////SHOPPING////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         */
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
                    if (shopping.businessType === types_2.BusinessType.MARKET_FULL) {
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
        /**
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////POSTS///////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         */
        this.getPostsResources = async (posts) => {
            const { getOnePostShoppingData } = await this.shoppingServices.getShoppingDataFromPosts({
                posts
            });
            const { getOneBusinessData } = await this.businessServices.getBusinessDataFrom({
                query: {
                    routeName: (0, schemas_1.getInArrayQuery)(posts.map(({ routeName }) => routeName))
                }
            });
            const { getCopyAndFlattenPost } = await this.postServices.useGetCopyAndFlattenPost();
            const { getReviewSummary } = await this.postServices.getReviewSummaryData({
                posts
            });
            const { getReviews } = await this.postServices.getReviewsData({
                posts
            });
            return {
                getOnePostShoppingData,
                getOneBusinessData,
                getCopyAndFlattenPost,
                getReviewSummary,
                getReviews
            };
        };
        this.getSearchDto = async (posts) => {
            const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData, getReviewSummary } = await this.getPostsResources(posts);
            const getSearchPostDto = async (post) => {
                const { stockAmountAvailable } = getOnePostShoppingData(post);
                const { reviewSummary } = getReviewSummary(post);
                const { businessType, businessName, businessAllowedOnlyCUPinCash } = getOneBusinessData({
                    routeName: post.routeName
                });
                return {
                    ...getCopyAndFlattenPost(post, {
                        transformCurrenciesOfSale: true,
                        transformCurrencyAndPrice: true
                    }),
                    searchDtoReturnType: types_3.NlpSearchReturnType.POST,
                    stockAmountAvailable,
                    businessType,
                    businessName,
                    businessAllowedOnlyCUPinCash,
                    reviewSummary
                };
            };
            /**
             *  ////////////////////////////////////////////////////////////////
             */
            /**
             * ////////////////////////////////////////////////////////////
             */
            const out = await Promise.all(posts.map(getSearchPostDto));
            return out;
        };
        this.getPostsDto = async (posts) => {
            const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData, getReviewSummary, getReviews } = await this.getPostsResources(posts);
            const getPostDto = async (post) => {
                const { stockAmountAvailable } = getOnePostShoppingData(post);
                const { reviewSummary } = getReviewSummary(post);
                const { reviews } = getReviews(post);
                const { businessType, businessName } = getOneBusinessData({
                    routeName: post.routeName
                });
                return {
                    ...getCopyAndFlattenPost(post, {
                        transformCurrenciesOfSale: true,
                        transformCurrencyAndPrice: true
                    }),
                    stockAmountAvailable,
                    businessType,
                    businessName,
                    reviewSummary,
                    reviews
                };
            };
            const promises = posts.map(getPostDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getPostsOwnerDto = async (posts) => {
            const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData } = await this.getPostsResources(posts);
            const getPostDto = async (post) => {
                const { amountInProcess, stockAmountAvailable, stockAmount } = getOnePostShoppingData(post);
                const { businessType } = getOneBusinessData({
                    routeName: post.routeName
                });
                return {
                    ...getCopyAndFlattenPost(post, {
                        transformCurrenciesOfSale: false,
                        transformCurrencyAndPrice: false
                    }),
                    stockAmount,
                    stockAmountAvailable,
                    amountInProcess,
                    businessType
                };
            };
            const promises = posts.map(getPostDto);
            const out = await Promise.all(promises);
            return out;
        };
        /**
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////HELPER///////////////////////////////
         * //////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////
         */
        this.getHelperDto = async (helpers) => {
            const allRelated = await this.helperServices.getAll({
                query: {
                    _id: (0, schemas_1.getInArrayQuery)(helpers.map((helper) => helper.relatedIds || []).flat())
                }
            });
            const getDto = (helper) => {
                return {
                    ...(0, general_1.deepJsonCopy)(helper),
                    relatedHelpers: (0, general_1.compact)((helper.relatedIds || []).map((relatedId) => {
                        const relatedHelper = allRelated.find((faq) => (0, general_1.isEqualIds)(faq.id, relatedId));
                        if (!relatedHelper) {
                            return undefined;
                        }
                        if (relatedHelper.hidden) {
                            return undefined;
                        }
                        return {
                            helperSlug: relatedHelper.helperSlug,
                            title: relatedHelper.title
                        };
                    }))
                };
            };
            return helpers.map(getDto);
        };
    }
}
exports.DtosServices = DtosServices;
