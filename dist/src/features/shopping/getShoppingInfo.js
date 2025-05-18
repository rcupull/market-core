"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShoppingInfo = void 0;
const general_1 = require("../../types/general");
const general_2 = require("../../utils/general");
const price_1 = require("../../utils/price");
const utils_1 = require("./utils");
const getShoppingInfo = (shopping) => {
    const { posts, requestedDelivery, exchangeRates } = shopping;
    /**
     * ///////////////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////////////
     * Compute currenciesToSale
     * ///////////////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////////////
     */
    const currenciesToSale = (() => {
        const allAvailableCurrenciesInPosts = posts.reduce((acc, { postData }) => {
            const { currenciesOfSale = [] } = postData;
            return currenciesOfSale.reduce((acc2, c) => (0, general_2.addStringToUniqueArray)(acc2, c), acc);
        }, []);
        //////////////////////////////////////////////////////////////////////////
        const currenciesToSale = allAvailableCurrenciesInPosts.reduce((acc, c) => {
            const shouldAdd = posts.every(({ postData }) => {
                const { currenciesOfSale } = postData;
                return currenciesOfSale === null || currenciesOfSale === void 0 ? void 0 : currenciesOfSale.includes(c);
            });
            return shouldAdd ? [...acc, c] : acc;
        }, []);
        //////////////////////////////////////////////////////////////////////////
        if (!currenciesToSale.length && allAvailableCurrenciesInPosts.includes(general_1.Currency.MLC)) {
            currenciesToSale.push(general_1.Currency.MLC);
        }
        if (!currenciesToSale.length && allAvailableCurrenciesInPosts.includes(general_1.Currency.USD)) {
            currenciesToSale.push(general_1.Currency.USD);
        }
        if (!currenciesToSale.length) {
            currenciesToSale.push(general_1.Currency.CUP);
        }
        return currenciesToSale;
    })();
    const getPriceForSeller = (commissions, salePrice) => {
        const { marketOperation, systemUse } = commissions;
        const marketOperationPrice = (0, utils_1.getCommissionPrice)(marketOperation, salePrice);
        const systemUsePrice = (0, utils_1.getCommissionPrice)(systemUse, salePrice);
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
    const getPricesForDesiredCurrency = (desiredCurrency) => {
        /**
         * ///////////////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////////////
         * compute deliveryprice
         * (The price of delivery is generated in CUP, then we need convert
         * this money to the same currency to the products )
         * ///////////////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////////////
         */
        const { deliveryPrice, saleDeliveryPrice, marketOperationDeliveryPrice, systemUseDeliveryPrice } = (() => {
            if (!requestedDelivery) {
                return {
                    deliveryPrice: 0,
                    saleDeliveryPrice: 0,
                    marketOperationDeliveryPrice: 0,
                    systemUseDeliveryPrice: 0
                };
            }
            const { commissions, salePrice } = requestedDelivery;
            const { priceForSeller, marketOperationPrice, systemUsePrice } = getPriceForSeller(commissions, salePrice);
            const deliveryPrice = (0, price_1.getConvertedPrice)({
                price: priceForSeller,
                currentCurrency: general_1.Currency.CUP,
                desiredCurrency,
                exchangeRates
            });
            const saleDeliveryPrice = (0, price_1.getConvertedPrice)({
                price: salePrice,
                currentCurrency: general_1.Currency.CUP,
                desiredCurrency,
                exchangeRates
            });
            const marketOperationDeliveryPrice = (0, price_1.getConvertedPrice)({
                price: marketOperationPrice,
                currentCurrency: general_1.Currency.CUP,
                desiredCurrency,
                exchangeRates
            });
            const systemUseDeliveryPrice = (0, price_1.getConvertedPrice)({
                price: systemUsePrice,
                currentCurrency: general_1.Currency.CUP,
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
        const getProductPrices = (postData) => {
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
            const { priceForSeller, marketOperationPrice, systemUsePrice } = getPriceForSeller(commissions, salePrice);
            const productPrice = (0, price_1.getConvertedPrice)({
                price: priceForSeller,
                currentCurrency: currency,
                desiredCurrency: desiredCurrency,
                exchangeRates
            });
            const saleProductPrice = (0, price_1.getConvertedPrice)({
                price: salePrice,
                currentCurrency: currency,
                desiredCurrency: desiredCurrency,
                exchangeRates
            });
            const marketOperationProductPrice = (0, price_1.getConvertedPrice)({
                price: marketOperationPrice,
                currentCurrency: currency,
                desiredCurrency: desiredCurrency,
                exchangeRates
            });
            const systemUseProductPrice = (0, price_1.getConvertedPrice)({
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
        const { productsAmount, productsPrice, saleProductsPrice } = posts.reduce((acc, { count, postData }) => {
            const { productPrice, saleProductPrice } = getProductPrices(postData);
            return {
                productsAmount: acc.productsAmount + count,
                productsPrice: acc.productsPrice + count * productPrice,
                saleProductsPrice: acc.saleProductsPrice + count * saleProductPrice
            };
        }, {
            productsAmount: 0,
            productsPrice: 0,
            saleProductsPrice: 0
        });
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
        currenciesToSaleCash: currenciesToSale.filter((c) => [general_1.Currency.CUP, general_1.Currency.USD].includes(c)),
        currenciesToSale,
        getPricesForDesiredCurrency
    };
};
exports.getShoppingInfo = getShoppingInfo;
