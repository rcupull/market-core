import { compact, deepJsonCopy, isEqualIds } from '../../utils/general';
import { getInArrayQuery, lastUpQuerySort } from '../../utils/schemas';
import { AuthServices } from '../auth/services';
import { AuthSessionState } from '../auth/types';
import { BusinessServices } from '../business/services';
import { BusinessType } from '../business/types';
import { ConfigServices } from '../config/services';
import { AdminConfig } from '../config/types';
import { HelperServices } from '../helper/services';
import { Helper, HelperDto } from '../helper/types';
import { PaymentProofServices } from '../payment-proof/services';
import { PaymentProof, PaymentProofDto } from '../payment-proof/types';
import { PaymentServices } from '../payment/services';
import { PostServices } from '../post/services';
import { Post, PostDto } from '../post/types';
import { NlpSearchReturnType, SearchDto, SearchPostDto } from '../search/types';
import { ShoppingServices } from '../shopping/services';
import { Shopping, ShoppingCartDto, ShoppingDto } from '../shopping/types';
import { UserServices } from '../user/services';
import { User, UserDto } from '../user/types';

export class DtosServices {
  constructor(
    private readonly businessServices: BusinessServices,
    private readonly authServices: AuthServices,
    private readonly userServices: UserServices,
    private readonly paymentServices: PaymentServices,
    private readonly paymentProofServices: PaymentProofServices,
    private readonly configServices: ConfigServices,
    private readonly shoppingServices: ShoppingServices,
    private readonly postServices: PostServices,
    private readonly helperServices: HelperServices
  ) {}

  /**
   * //////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////
   * ///////////////////////PAYMENT PROOF//////////////////////////
   * //////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////
   */

  getPaymentProofsDto = async (
    paymentProofs: Array<PaymentProof>
  ): Promise<Array<PaymentProofDto>> => {
    //////////////////////////////////////////////////////////////////////

    const allShopping = await this.shoppingServices.getAll({
      query: {
        _id: getInArrayQuery(paymentProofs.map((p) => p.shoppingId))
      }
    });

    //////////////////////////////////////////////////////////////////////

    const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
      query: {
        shoppingId: getInArrayQuery(paymentProofs.map((p) => p.shoppingId))
      }
    });

    //////////////////////////////////////////////////////////////////////

    const config: Pick<AdminConfig, 'billing'> | null =
      await this.configServices.adminConfigServicesGetOne({
        projection: {
          billing: 1
        }
      });

    //////////////////////////////////////////////////////////////////////

    const customers = await this.userServices.getAll({
      query: {
        _id: getInArrayQuery(paymentProofs.map((p) => p.customerId))
      }
    });

    //////////////////////////////////////////////////////////////////////

    const getDto = (paymentProof: PaymentProof): PaymentProofDto => {
      const customer = customers.find((c) => isEqualIds(c._id, paymentProof.customerId));
      const shopping = allShopping.find((s) => isEqualIds(s._id, paymentProof.shoppingId));

      const shoppingAllPayments =
        shopping && getOneShoppingPaymentData(shopping)?.shoppingAllPayments;

      return {
        ...deepJsonCopy(paymentProof),
        sellerName: config?.billing?.name,
        sellerEmail: 'comercial@eltrapichecubiche.com',
        sellerPhone: '+53 5020 5971',
        //
        customerName: customer?.name,
        customerPhone: customer?.phone,
        customerAddress: customer?.addresses?.[0],
        //
        shoppingCode: shopping?.code,
        shoppingProducts: (shopping?.posts || []).map(({ postData, count }) => ({
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

  getUsersDto = async (users: Array<User>): Promise<Array<UserDto>> => {
    const { getFavoritesBusiness } = await this.businessServices.getBusinessFavoritesData({
      query: {
        favoritesUserIds: getInArrayQuery(users.map((user) => user._id))
      }
    });

    const getDto = async (user: User): Promise<UserDto> => {
      const out: UserDto = {
        ...deepJsonCopy(user),
        favoritesBusiness: getFavoritesBusiness({ userId: user._id }),
        hasOpenSession: false,
        lastAccessAt: undefined
      };

      const lastSession = await this.authServices.getOne({
        query: { userId: user._id },
        sort: lastUpQuerySort
      });

      if (!lastSession) {
        return out;
      }

      const refreshHistory = lastSession.refreshHistory;
      const lastAccessAt = refreshHistory[refreshHistory.length - 1];

      out.hasOpenSession = lastSession.state === AuthSessionState.OPEN;
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

  private getShoppingsResources = async (shoppings: Array<Shopping>) => {
    const { getOnePurchaserData } = await this.userServices.getPurchasersData({
      query: { _id: { $in: shoppings.map(({ purchaserId }) => purchaserId) } }
    });

    const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
      query: { shoppingId: getInArrayQuery(shoppings.map(({ _id }) => _id)) }
    });

    const { getOneShoppingPaymentProofData } =
      await this.paymentProofServices.getPaymentProofDataFromShopping({
        query: { shoppingId: getInArrayQuery(shoppings.map(({ _id }) => _id)) }
      });

    const { getOneBusinessData } = await this.businessServices.getBusinessDataFrom({
      /**
       * is the shopping has  routename is of a self managed business, else if managed by the marketplace
       */
      query: { routeNames: compact(shoppings.map(({ routeName }) => routeName)) }
    });

    const { adminDeliveryConfig, marketAddress } =
      await this.configServices.adminConfigServicesGetDeliveryConfig();

    return {
      getOnePurchaserData,
      getOneShoppingPaymentData,
      getOneShoppingPaymentProofData,
      getOneBusinessData,
      adminDeliveryConfig,
      marketAddress
    };
  };

  getShoppingsCartDto = async (shoppings: Array<Shopping>): Promise<Array<ShoppingCartDto>> => {
    const { adminDeliveryConfig, getOneBusinessData } = await this.getShoppingsResources(shoppings);

    /**
     * Searching for all posts
     */
    const allPostsIds = shoppings.map((s) => s.posts.map((p) => p.postData._id)).flat();
    const allShoppingPosts = await this.postServices.getAll({
      query: {
        _id: getInArrayQuery(allPostsIds)
      }
    });

    const { getOnePostShoppingData } = await this.shoppingServices.getShoppingDataFromPosts({
      posts: allShoppingPosts
    });

    const getShoppingDto = async (shopping: Shopping): Promise<ShoppingCartDto> => {
      const businessData = getOneBusinessData({ routeName: shopping.routeName });

      const out: ShoppingCartDto = {
        ...deepJsonCopy(shopping),
        posts: shopping.posts.map((shoppingPostMeta) => {
          const { postData, count } = shoppingPostMeta;
          const post = allShoppingPosts.find((p) => isEqualIds(p._id, postData._id));

          const stockAmountAvailable = post
            ? getOnePostShoppingData(post).stockAmountAvailable + count
            : undefined;

          return {
            ...deepJsonCopy(shoppingPostMeta),
            stockAmountAvailable
          };
        }),
        ////////////////////////////////////////
        businessName: businessData?.businessName,
        businessAddress: businessData?.businessAddress,
        businessTermsAndConditions: businessData?.businessTermsAndConditions,
        businessAllowedOnlyCUPinCash: businessData?.businessAllowedOnlyCUPinCash,
        ////////////////////////////////////////
        deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
          businessType: shopping.businessType,
          adminDeliveryConfig,
          businessDeliveryConfig: businessData?.businessDeliveryConfig
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

  getShoppingsPurchaserDto = async (shoppings: Array<Shopping>): Promise<Array<ShoppingDto>> => {
    const {
      adminDeliveryConfig,
      getOneBusinessData,
      getOneShoppingPaymentData,
      getOneShoppingPaymentProofData,
      getOnePurchaserData,
      marketAddress
    } = await this.getShoppingsResources(shoppings);

    const getShoppingDto = async (shopping: Shopping): Promise<ShoppingDto> => {
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
        if (shopping.businessType === BusinessType.MARKET_FULL) {
          return marketAddress;
        }

        return businessData?.businessAddress;
      };

      const out: ShoppingDto = {
        ...deepJsonCopy(shopping),
        ////////////////////////////////////////
        businessName: businessData?.businessName,
        businessAddress: businessData?.businessAddress,
        businessTermsAndConditions: businessData?.businessTermsAndConditions,
        businessAllowedOnlyCUPinCash: businessData?.businessAllowedOnlyCUPinCash,
        ////////////////////////////////////////
        deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
          businessType: shopping.businessType,
          adminDeliveryConfig,
          businessDeliveryConfig: businessData?.businessDeliveryConfig
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
        paymentProofCode: paymentProofData?.paymentProofCode,
        paymentProofId: paymentProofData?.paymentProofId
      };

      const getShoppingWithPurcherData = (out: ShoppingDto): ShoppingDto => {
        const purchaserData = getOnePurchaserData({ purchaserId: out.purchaserId });

        return {
          ...out,
          purchaserName: purchaserData?.purchaserName,
          purchaserAddress: purchaserData?.purchaserAddress,
          purchaserPhone: purchaserData?.purchaserPhone
        };
      };

      return this.shoppingServices.wasApprovedShopping(out) ? getShoppingWithPurcherData(out) : out;
    };

    const promises = shoppings.map(getShoppingDto);
    const out = await Promise.all(promises);

    return out;
  };

  getShoppingsAdminFullDto = async (shoppings: Array<Shopping>): Promise<Array<ShoppingDto>> => {
    const {
      adminDeliveryConfig,
      getOneBusinessData,
      getOneShoppingPaymentData,
      getOneShoppingPaymentProofData,
      getOnePurchaserData
    } = await this.getShoppingsResources(shoppings);

    const getShoppingDto = async (shopping: Shopping): Promise<ShoppingDto> => {
      const paymentData = getOneShoppingPaymentData(shopping);
      const businessData = getOneBusinessData({ routeName: shopping.routeName });
      const purchaserData = getOnePurchaserData({ purchaserId: shopping.purchaserId });
      const paymentProofData = getOneShoppingPaymentProofData({ shoppingId: shopping._id });

      //
      return {
        ...deepJsonCopy(shopping),
        ////////////////////////////////////////
        businessName: businessData?.businessName,
        businessAddress: businessData?.businessAddress,
        businessTermsAndConditions: businessData?.businessTermsAndConditions,
        businessAllowedOnlyCUPinCash: businessData?.businessAllowedOnlyCUPinCash,
        ////////////////////////////////////////
        addressToPickUp: undefined,
        ////////////////////////////////////////
        deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
          businessType: shopping.businessType,
          adminDeliveryConfig,
          businessDeliveryConfig: businessData?.businessDeliveryConfig
        }),
        ////////////////////////////////////////
        purchaserName: purchaserData?.purchaserName,
        purchaserAddress: purchaserData?.purchaserAddress,
        purchaserPhone: purchaserData?.purchaserPhone,
        ////////////////////////////////////////
        paymentCompleted: paymentData.paymentCompleted,
        paymentHistory: paymentData.paymentHistory,
        ////////////////////////////////////////
        paymentProofCode: paymentProofData?.paymentProofCode,
        paymentProofId: paymentProofData?.paymentProofId
      };
    };

    const promises = shoppings.map(getShoppingDto);
    const out = await Promise.all(promises);

    return out;
  };

  getShoppingsAdminDeliveryDto = async (
    shoppings: Array<Shopping>
  ): Promise<Array<ShoppingDto>> => {
    const {
      adminDeliveryConfig,
      getOneBusinessData,
      getOneShoppingPaymentData,
      getOnePurchaserData
    } = await this.getShoppingsResources(shoppings);

    const getShoppingDto = async (shopping: Shopping): Promise<ShoppingDto> => {
      const paymentData = getOneShoppingPaymentData(shopping);
      const businessData = getOneBusinessData({ routeName: shopping.routeName });
      const purchaserData = getOnePurchaserData({ purchaserId: shopping.purchaserId });

      return {
        ...deepJsonCopy(shopping),
        ////////////////////////////////////////
        businessName: businessData?.businessName,
        businessAddress: businessData?.businessAddress,
        businessTermsAndConditions: businessData?.businessTermsAndConditions,
        businessAllowedOnlyCUPinCash: businessData?.businessAllowedOnlyCUPinCash,
        ////////////////////////////////////////
        addressToPickUp: undefined,
        ////////////////////////////////////////
        deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
          businessType: shopping.businessType,
          adminDeliveryConfig,
          businessDeliveryConfig: businessData?.businessDeliveryConfig
        }),
        ////////////////////////////////////////
        purchaserName: purchaserData?.purchaserName,
        purchaserAddress: purchaserData?.purchaserAddress,
        purchaserPhone: purchaserData?.purchaserPhone,
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

  getShoppingsAdminSalesDto = async (shoppings: Array<Shopping>): Promise<Array<ShoppingDto>> => {
    const {
      adminDeliveryConfig,
      getOneBusinessData,
      getOneShoppingPaymentData,
      getOnePurchaserData
    } = await this.getShoppingsResources(shoppings);

    const getShoppingDto = async (shopping: Shopping): Promise<ShoppingDto> => {
      const paymentData = getOneShoppingPaymentData(shopping);
      const businessData = getOneBusinessData({ routeName: shopping.routeName });
      const purchaserData = getOnePurchaserData({ purchaserId: shopping.purchaserId });

      const out: ShoppingDto = {
        ...deepJsonCopy(shopping),
        ////////////////////////////////////////
        businessName: businessData?.businessName,
        businessAddress: businessData?.businessAddress,
        businessTermsAndConditions: businessData?.businessTermsAndConditions,
        businessAllowedOnlyCUPinCash: businessData?.businessAllowedOnlyCUPinCash,
        ////////////////////////////////////////
        deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
          businessType: shopping.businessType,
          adminDeliveryConfig,
          businessDeliveryConfig: businessData?.businessDeliveryConfig
        }),
        ////////////////////////////////////////
        addressToPickUp: undefined,
        ////////////////////////////////////////
        purchaserName: purchaserData?.purchaserName,
        purchaserAddress: purchaserData?.purchaserAddress,
        purchaserPhone: purchaserData?.purchaserPhone,
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

  getShoppingsOwnerDto = async (shoppings: Array<Shopping>): Promise<Array<ShoppingDto>> => {
    const {
      adminDeliveryConfig,
      getOneBusinessData,
      getOneShoppingPaymentData,
      getOnePurchaserData
    } = await this.getShoppingsResources(shoppings);

    const getShoppingDto = async (shopping: Shopping): Promise<ShoppingDto> => {
      const paymentData = getOneShoppingPaymentData(shopping);
      const businessData = getOneBusinessData({ routeName: shopping.routeName });

      const out: ShoppingDto = {
        ...deepJsonCopy(shopping),
        ////////////////////////////////////////
        businessName: businessData?.businessName,
        businessAddress: businessData?.businessAddress,
        businessTermsAndConditions: businessData?.businessTermsAndConditions,
        businessAllowedOnlyCUPinCash: businessData?.businessAllowedOnlyCUPinCash,
        ////////////////////////////////////////
        deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
          businessType: shopping.businessType,
          adminDeliveryConfig,
          businessDeliveryConfig: businessData?.businessDeliveryConfig
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

      const getShoppingWithPurcherData = (out: ShoppingDto): ShoppingDto => {
        const purchaserData = getOnePurchaserData({ purchaserId: out.purchaserId });

        return {
          ...out,
          purchaserName: purchaserData?.purchaserName,
          purchaserAddress: purchaserData?.purchaserAddress,
          purchaserPhone: purchaserData?.purchaserPhone
        };
      };

      return this.shoppingServices.wasApprovedShopping(out) ? getShoppingWithPurcherData(out) : out;
    };

    const promises = shoppings.map(getShoppingDto);
    const out = await Promise.all(promises);

    return out;
  };

  getShoppingsMessengerDto = async (shoppings: Array<Shopping>): Promise<Array<ShoppingDto>> => {
    const {
      adminDeliveryConfig,
      getOneBusinessData,
      getOneShoppingPaymentData,
      getOnePurchaserData
    } = await this.getShoppingsResources(shoppings);

    const getShoppingDto = async (shopping: Shopping): Promise<ShoppingDto> => {
      const paymentData = getOneShoppingPaymentData(shopping);
      const businessData = getOneBusinessData({ routeName: shopping.routeName });

      const out: ShoppingDto = {
        ...deepJsonCopy(shopping),
        ////////////////////////////////////////
        businessName: businessData?.businessName,
        businessAddress: businessData?.businessAddress,
        businessTermsAndConditions: businessData?.businessTermsAndConditions,
        businessAllowedOnlyCUPinCash: businessData?.businessAllowedOnlyCUPinCash,
        ////////////////////////////////////////
        deliveryConfigToUse: this.shoppingServices.getDeliveryConfigToUse({
          businessType: shopping.businessType,
          adminDeliveryConfig,
          businessDeliveryConfig: businessData?.businessDeliveryConfig
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

      const getShoppingWithPurcherData = (out: ShoppingDto): ShoppingDto => {
        const purchaserData = getOnePurchaserData({ purchaserId: out.purchaserId });

        return {
          ...out,
          purchaserName: purchaserData?.purchaserName,
          purchaserAddress: purchaserData?.purchaserAddress,
          purchaserPhone: purchaserData?.purchaserPhone
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

  private getPostsResources = async (posts: Array<Post>) => {
    const { getOnePostShoppingData } = await this.shoppingServices.getShoppingDataFromPosts({
      posts
    });

    const { getOneBusinessData } = await this.businessServices.getBusinessDataFrom({
      query: {
        routeName: getInArrayQuery(posts.map(({ routeName }) => routeName))
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

  getSearchDto = async (posts: Array<Post>): Promise<Array<SearchDto>> => {
    const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData, getReviewSummary } =
      await this.getPostsResources(posts);

    const getSearchPostDto = async (post: Post): Promise<SearchPostDto> => {
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
        searchDtoReturnType: NlpSearchReturnType.POST,
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

  getPostsDto = async (posts: Array<Post>): Promise<Array<PostDto>> => {
    const {
      getCopyAndFlattenPost,
      getOneBusinessData,
      getOnePostShoppingData,
      getReviewSummary,
      getReviews
    } = await this.getPostsResources(posts);

    const getPostDto = async (post: Post): Promise<PostDto> => {
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

  getPostsOwnerDto = async (posts: Array<Post>): Promise<Array<PostDto>> => {
    const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData } =
      await this.getPostsResources(posts);

    const getPostDto = async (post: Post): Promise<PostDto> => {
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

  getHelperDto = async (helpers: Array<Helper>): Promise<Array<HelperDto>> => {
    const allRelated = await this.helperServices.getAll({
      query: {
        _id: getInArrayQuery(helpers.map((helper) => helper.relatedIds || []).flat())
      }
    });

    const getDto = (helper: Helper): HelperDto => {
      return {
        ...deepJsonCopy(helper),
        relatedHelpers: compact(
          (helper.relatedIds || []).map((relatedId) => {
            const relatedHelper = allRelated.find((faq) => isEqualIds(faq.id, relatedId));

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
          })
        )
      };
    };

    return helpers.map(getDto);
  };
}
