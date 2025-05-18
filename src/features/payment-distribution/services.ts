import {
  DistributionCurrency,
  PaymentDistributionData,
  PaymentDistributionDataCurrency,
  PaymentDistributionMeta
} from './types';
import { getInArrayQuery } from '../../utils/schemas';

import { Currency } from '../../types/general';
import { addStringToUniqueArray, compact } from '../../utils/general';
import { Business, BusinessType } from '../business/types';
import { ShoppingServices } from '../shopping/services';
import { PaymentServices } from '../payment/services';
import { GetAllShoppingArgs, Shopping, ShoppingState } from '../shopping/types';
import { PaymentWay } from '../payment/types';

interface Args {
  dateFrom?: Date;
  dateTo?: Date;
  business: Business;
}

export class PaymentDistributionServices {
  constructor(
    private readonly shoppingServices: ShoppingServices,
    private readonly paymentServices: PaymentServices
  ) {}

  getPaymentDistributionData = async (args: Args): Promise<PaymentDistributionMeta> => {
    const { business } = args;

    const { businessType } = business;

    /**
     * ////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////
     * compute money
     * ////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////
     */

    if (businessType === BusinessType.BUSINESS_FULL) {
      return await this.getData__BUSINESS_FULL(args);
    }

    if (businessType === BusinessType.MARKET_FULL) {
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

  private getAssociatedShoppings = async (args: Partial<Args>): Promise<Array<Shopping>> => {
    const { business, dateFrom, dateTo } = args;

    const allShopping = await this.shoppingServices.getAll({
      query: (() => {
        const out: GetAllShoppingArgs = {
          /**
           * Filter the shopping DELIVERED in the date range
           */
          /**
           * TODO: falta excluir las que no estan en el rango que se debe pagar.
           *  Eso deberia tenerse en cuenta en el proceso de facturacion y liquidacion. OJOOO
           */
          state: ShoppingState.DELIVERED,
          history: {
            $elemMatch: {
              state: ShoppingState.DELIVERED,
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
            case BusinessType.BUSINESS_FULL:
            case BusinessType.MARKET_DELIVERY: {
              out.routeName = routeName;
              out.businessType = businessType;
              break;
            }
            case BusinessType.MARKET_FULL: {
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

  public getShoppingResources = async (args: Partial<Args>) => {
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
        shoppingId: getInArrayQuery(allShopping.map(({ _id }) => _id)),
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

  private getData__BUSINESS_FULL = async (args: Args): Promise<PaymentDistributionMeta> => {
    const { allowedShopping, getOneShoppingPaymentData } = await this.getShoppingResources(args);

    /**
     * //////////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////////
     */
    const getDataProduct = (args: {
      currency: Currency;
      paymentWays: Array<PaymentWay>;
      shopping: Shopping;
    }) => {
      const { currency, paymentWays, shopping } = args;
      const { posts } = shopping;
      const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
      const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);

      const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos

      if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay)) return;

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
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: getDataProduct({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.CASH],
            shopping
          }),
          [DistributionCurrency.CUP_TRAN]: undefined,
          [DistributionCurrency.MLC]: undefined,
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    const get_productMarket = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: undefined,
          [DistributionCurrency.CUP_TRAN]: getDataProduct({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.MLC]: getDataProduct({
            currency: Currency.MLC,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    /**
     * //////////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////////
     */
    const getDataCommision = (args: {
      currency: Currency;
      paymentWays: Array<PaymentWay>;
      shopping: Shopping;
    }) => {
      const { currency, paymentWays, shopping } = args;
      const { posts } = shopping;
      const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
      const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);

      const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos

      if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay)) return;

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
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: getDataCommision({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.CASH],
            shopping
          }),
          [DistributionCurrency.CUP_TRAN]: undefined,
          [DistributionCurrency.MLC]: undefined,
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    const get_commisionMarket = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: undefined,
          [DistributionCurrency.CUP_TRAN]: getDataCommision({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.MLC]: getDataCommision({
            currency: Currency.MLC,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    /**
     * //////////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////////
     */
    const getDataDelivery = (args: {
      currency: Currency;
      paymentWays: Array<PaymentWay>;
      shopping: Shopping;
    }) => {
      const { currency, paymentWays, shopping } = args;
      const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
      const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);

      const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos

      if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay)) return;

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
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: getDataDelivery({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.CASH],
            shopping
          }),
          [DistributionCurrency.CUP_TRAN]: undefined,
          [DistributionCurrency.MLC]: undefined,
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    const get_deliveryMarket = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: undefined,
          [DistributionCurrency.CUP_TRAN]: getDataDelivery({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.MLC]: getDataDelivery({
            currency: Currency.MLC,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.USD]: undefined
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

  private howManyBusinessAreInShoppingPosts = (shopping: Shopping) => {
    let routeNames: Array<string> = [];
    shopping.posts.forEach(({ postData }) => {
      routeNames = addStringToUniqueArray(routeNames, postData.routeName);
    });

    return routeNames.length;
  };

  private getData__MARKET_FULL = async (args: Args): Promise<PaymentDistributionMeta> => {
    const { allowedShopping, getOneShoppingPaymentData } = await this.getShoppingResources(args);

    const { business } = args;
    /**
     * //////////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////////
     */
    const getDataProduct = (args: {
      currency: Currency;
      paymentWays: Array<PaymentWay>;
      shopping: Shopping;
    }): PaymentDistributionDataCurrency | undefined => {
      const { currency, paymentWays, shopping } = args;
      const { posts } = shopping;
      const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
      const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);

      const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos

      if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay)) return;

      const { getProductPrices } = getPricesForDesiredCurrency(currency);

      /**
       * //////////////////////////////////////////////////////////////////////////////
       * //////////////////////////////////////////////////////////////////////////////
       */
      const deliveryAmount = 0;

      return {
        deliveryAmount,
        postsData: compact(
          posts.map(({ count, postData }) => {
            if (business.routeName !== postData.routeName) return;

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
          })
        )
      };
    };

    const get_productMarket = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: getDataProduct({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.CASH],
            shopping
          }),
          [DistributionCurrency.CUP_TRAN]: getDataProduct({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.TRANSFERMOVIL, PaymentWay.ENZONA],
            shopping
          }),
          [DistributionCurrency.MLC]: getDataProduct({
            currency: Currency.MLC,
            paymentWays: [PaymentWay.TRANSFERMOVIL, PaymentWay.ENZONA],
            shopping
          }),
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    const get_productBusiness = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: undefined,
          [DistributionCurrency.CUP_TRAN]: undefined,
          [DistributionCurrency.MLC]: undefined,
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    /**
     * //////////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////////
     */
    const getDataCommision = (args: {
      currency: Currency;
      paymentWays: Array<PaymentWay>;
      shopping: Shopping;
    }): PaymentDistributionDataCurrency | undefined => {
      const { currency, paymentWays, shopping } = args;
      const { posts } = shopping;
      const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
      const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);

      const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos

      if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay)) return;

      const { getProductPrices } = getPricesForDesiredCurrency(currency);

      /**
       * //////////////////////////////////////////////////////////////////////////////
       * //////////////////////////////////////////////////////////////////////////////
       */

      const deliveryAmount = 0;
      return {
        deliveryAmount,
        postsData: compact(
          posts.map(({ count, postData }) => {
            if (business.routeName !== postData.routeName) return;

            const { systemUseProductPrice, marketOperationProductPrice } =
              getProductPrices(postData);

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
          })
        )
      };
    };

    const get_commisionMarket = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: getDataCommision({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.CASH],
            shopping
          }),
          [DistributionCurrency.CUP_TRAN]: getDataCommision({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.TRANSFERMOVIL, PaymentWay.ENZONA],
            shopping
          }),
          [DistributionCurrency.MLC]: getDataCommision({
            currency: Currency.MLC,
            paymentWays: [PaymentWay.TRANSFERMOVIL, PaymentWay.ENZONA],
            shopping
          }),
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    const get_commisionBusiness = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: undefined,
          [DistributionCurrency.CUP_TRAN]: undefined,
          [DistributionCurrency.MLC]: undefined,
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    /**
     * //////////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////////
     */
    const getDataDelivery = (args: {
      currency: Currency;
      paymentWays: Array<PaymentWay>;
      shopping: Shopping;
    }) => {
      const { currency, paymentWays, shopping } = args;
      const { shoppingAllPayments } = getOneShoppingPaymentData(shopping);
      const { getPricesForDesiredCurrency } = this.shoppingServices.getShoppingInfo(shopping);

      const payment = shoppingAllPayments[0]; // TODO evaluar para varios pagos

      if (currency !== payment.currency || !paymentWays.includes(payment.paymentWay)) return;

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
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: getDataDelivery({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.CASH],
            shopping
          }),
          [DistributionCurrency.CUP_TRAN]: getDataDelivery({
            currency: Currency.CUP,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.MLC]: getDataDelivery({
            currency: Currency.MLC,
            paymentWays: [PaymentWay.ENZONA, PaymentWay.TRANSFERMOVIL],
            shopping
          }),
          [DistributionCurrency.USD]: undefined
        };

        return [...acc, shoppingData];
      }, []);
    };

    const get_deliveryBusiness = () => {
      return allowedShopping.reduce<Array<PaymentDistributionData>>((acc, shopping) => {
        const { _id, code } = shopping;

        const shoppingData: PaymentDistributionData = {
          shoppingCode: code,
          shoppingId: _id,
          [DistributionCurrency.CUP_CASH]: undefined,
          [DistributionCurrency.CUP_TRAN]: undefined,
          [DistributionCurrency.MLC]: undefined,
          [DistributionCurrency.USD]: undefined
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

  public getTotalAmount = (allShoppingDistrubutions: Array<PaymentDistributionData>) => {
    return allShoppingDistrubutions.reduce(
      (acc, shoppingDistribution) => {
        const out = { ...acc };

        Object.values(DistributionCurrency).forEach((distributionCurrency) => {
          const value = shoppingDistribution[distributionCurrency];

          if (value) {
            out[distributionCurrency] =
              out[distributionCurrency] +
              value.deliveryAmount +
              value.postsData.reduce((acc2, { postAmount }) => acc2 + postAmount, 0);
          }
        });

        return out;
      },
      {
        [DistributionCurrency.CUP_CASH]: 0,
        [DistributionCurrency.CUP_TRAN]: 0,
        [DistributionCurrency.MLC]: 0,
        [DistributionCurrency.USD]: 0
      }
    );
  };

  public getTotalAmountFromOne = ({
    deliveryAmount,
    postsData
  }: PaymentDistributionDataCurrency) => {
    return deliveryAmount + postsData.reduce((acc2, { postAmount }) => acc2 + postAmount, 0);
  };
}
