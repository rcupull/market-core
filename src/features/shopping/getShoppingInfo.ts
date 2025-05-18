import { Commissions } from '../../types/commision';
import { Currency } from '../../types/general';
import { addStringToUniqueArray } from '../../utils/general';
import { getConvertedPrice } from '../../utils/price';
import { Shopping, ShoppingPostData } from './types';
import { getCommissionPrice } from './utils';

type GetProductPrices = (postData: ShoppingPostData) => {
  productPrice: number;
  saleProductPrice: number;
  marketOperationProductPrice: number;
  systemUseProductPrice: number;
};

type GetPricesForDesiredCurrency = (desiredCurrency: Currency) => {
  deliveryPrice: number;
  saleDeliveryPrice: number;
  marketOperationDeliveryPrice: number;
  systemUseDeliveryPrice: number;
  //
  productsAmount: number;
  productsPrice: number;
  saleProductsPrice: number;
  getProductPrices: GetProductPrices;
  //
  saleTotalPrice: number;
};

interface GetShoppingInfoReturn {
  firstCurrency: Currency;
  currenciesToSale: Array<Currency>;
  currenciesToSaleCash: Array<Currency>;

  getPricesForDesiredCurrency: GetPricesForDesiredCurrency;
}

export const getShoppingInfo = (shopping: Shopping): GetShoppingInfoReturn => {
  const { posts, requestedDelivery, exchangeRates } = shopping;

  /**
   * ///////////////////////////////////////////////////////////////////////////
   * ///////////////////////////////////////////////////////////////////////////
   * Compute currenciesToSale
   * ///////////////////////////////////////////////////////////////////////////
   * ///////////////////////////////////////////////////////////////////////////
   */
  const currenciesToSale = (() => {
    const allAvailableCurrenciesInPosts = posts.reduce<Array<Currency>>((acc, { postData }) => {
      const { currenciesOfSale = [] } = postData;

      return currenciesOfSale.reduce((acc2, c) => addStringToUniqueArray(acc2, c), acc);
    }, []);

    //////////////////////////////////////////////////////////////////////////
    const currenciesToSale = allAvailableCurrenciesInPosts.reduce<Array<Currency>>((acc, c) => {
      const shouldAdd = posts.every(({ postData }) => {
        const { currenciesOfSale } = postData;
        return currenciesOfSale?.includes(c);
      });

      return shouldAdd ? [...acc, c] : acc;
    }, []);

    //////////////////////////////////////////////////////////////////////////
    if (!currenciesToSale.length && allAvailableCurrenciesInPosts.includes(Currency.MLC)) {
      currenciesToSale.push(Currency.MLC);
    }

    if (!currenciesToSale.length && allAvailableCurrenciesInPosts.includes(Currency.USD)) {
      currenciesToSale.push(Currency.USD);
    }

    if (!currenciesToSale.length) {
      currenciesToSale.push(Currency.CUP);
    }

    return currenciesToSale;
  })();

  const getPriceForSeller = (
    commissions: Commissions,
    salePrice: number
  ): {
    priceForSeller: number;
    marketOperationPrice: number;
    systemUsePrice: number;
  } => {
    const { marketOperation, systemUse } = commissions;

    const marketOperationPrice = getCommissionPrice(marketOperation, salePrice);
    const systemUsePrice = getCommissionPrice(systemUse, salePrice);

    return {
      priceForSeller: salePrice - marketOperationPrice - systemUsePrice,
      marketOperationPrice,
      systemUsePrice
    };
  };

  /**
   * ///////////////////////////////////////////////////////////////////////////
   * ///////////////////////////////////////////////////////////////////////////
   * Compute currency
   * ///////////////////////////////////////////////////////////////////////////
   * ///////////////////////////////////////////////////////////////////////////
   */

  const getPricesForDesiredCurrency: GetPricesForDesiredCurrency = (desiredCurrency) => {
    /**
     * ///////////////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////////////
     * compute deliveryprice
     * (The price of delivery is generated in CUP, then we need convert
     * this money to the same currency to the products )
     * ///////////////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////////////
     */

    const {
      deliveryPrice,
      saleDeliveryPrice,
      marketOperationDeliveryPrice,
      systemUseDeliveryPrice
    } = (() => {
      if (!requestedDelivery) {
        return {
          deliveryPrice: 0,
          saleDeliveryPrice: 0,
          marketOperationDeliveryPrice: 0,
          systemUseDeliveryPrice: 0
        };
      }

      const { commissions, salePrice } = requestedDelivery;

      const { priceForSeller, marketOperationPrice, systemUsePrice } = getPriceForSeller(
        commissions,
        salePrice
      );

      const deliveryPrice = getConvertedPrice({
        price: priceForSeller,
        currentCurrency: Currency.CUP,
        desiredCurrency,
        exchangeRates
      });

      const saleDeliveryPrice = getConvertedPrice({
        price: salePrice,
        currentCurrency: Currency.CUP,
        desiredCurrency,
        exchangeRates
      });

      const marketOperationDeliveryPrice = getConvertedPrice({
        price: marketOperationPrice,
        currentCurrency: Currency.CUP,
        desiredCurrency,
        exchangeRates
      });

      const systemUseDeliveryPrice = getConvertedPrice({
        price: systemUsePrice,
        currentCurrency: Currency.CUP,
        desiredCurrency,
        exchangeRates
      });

      return {
        deliveryPrice,
        saleDeliveryPrice,
        marketOperationDeliveryPrice,
        systemUseDeliveryPrice
      };
    })();

    /**
     * ///////////////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////////////
     * Compute products prices
     * ///////////////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////////////
     */

    const getProductPrices: GetProductPrices = (postData) => {
      const { salePrice, commissions, currency } = postData;

      if (!currency) {
        console.error('The currency should be have some value');
        return {
          productPrice: 0,
          saleProductPrice: 0,
          marketOperationProductPrice: 0,
          systemUseProductPrice: 0
        };
      }

      const { priceForSeller, marketOperationPrice, systemUsePrice } = getPriceForSeller(
        commissions,
        salePrice
      );

      const productPrice = getConvertedPrice({
        price: priceForSeller,
        currentCurrency: currency,
        desiredCurrency: desiredCurrency,
        exchangeRates
      });

      const saleProductPrice = getConvertedPrice({
        price: salePrice,
        currentCurrency: currency,
        desiredCurrency: desiredCurrency,
        exchangeRates
      });

      const marketOperationProductPrice = getConvertedPrice({
        price: marketOperationPrice,
        currentCurrency: currency,
        desiredCurrency: desiredCurrency,
        exchangeRates
      });

      const systemUseProductPrice = getConvertedPrice({
        price: systemUsePrice,
        currentCurrency: currency,
        desiredCurrency: desiredCurrency,
        exchangeRates
      });

      return {
        productPrice,
        saleProductPrice,
        marketOperationProductPrice,
        systemUseProductPrice
      };
    };

    const { productsAmount, productsPrice, saleProductsPrice } = posts.reduce(
      (acc, { count, postData }) => {
        const { productPrice, saleProductPrice } = getProductPrices(postData);

        return {
          productsAmount: acc.productsAmount + count,
          productsPrice: acc.productsPrice + count * productPrice,
          saleProductsPrice: acc.saleProductsPrice + count * saleProductPrice
        };
      },
      {
        productsAmount: 0,
        productsPrice: 0,
        saleProductsPrice: 0
      }
    );

    return {
      deliveryPrice,
      saleDeliveryPrice,
      marketOperationDeliveryPrice,
      systemUseDeliveryPrice,
      //
      productsAmount,
      productsPrice,
      saleProductsPrice,
      getProductPrices,
      //
      saleTotalPrice: saleProductsPrice + saleDeliveryPrice
    };
  };

  /**
   * ///////////////////////////////////////////////////////////////////////////
   * ///////////////////////////////////////////////////////////////////////////
   * return
   * ///////////////////////////////////////////////////////////////////////////
   * ///////////////////////////////////////////////////////////////////////////
   */

  return {
    firstCurrency: currenciesToSale[0],
    currenciesToSaleCash: currenciesToSale.filter((c) => [Currency.CUP, Currency.USD].includes(c)),
    currenciesToSale,
    getPricesForDesiredCurrency
  };
};
