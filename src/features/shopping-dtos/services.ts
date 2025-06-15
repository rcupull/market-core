import { compact, deepJsonCopy, isEqualIds } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';
import { BusinessServices } from '../business/services';
import { BusinessType } from '../business/types';
import { ConfigServices } from '../config/services';
import { PaymentProofServices } from '../payment-proof/services';
import { PaymentServices } from '../payment/services';
import { PostServices } from '../post/services';
import { ShoppingServices } from '../shopping/services';
import { Shopping } from '../shopping/types';
import { UserServices } from '../user/services';
import { ShoppingCartDto, ShoppingDto } from './types';

export class ShoppingDtosServices {
  constructor(
    private readonly businessServices: BusinessServices,
    private readonly userServices: UserServices,
    private readonly paymentServices: PaymentServices,
    private readonly paymentProofServices: PaymentProofServices,
    private readonly configServices: ConfigServices,
    private readonly shoppingServices: ShoppingServices,
    private readonly postServices: PostServices
  ) {}

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
}
