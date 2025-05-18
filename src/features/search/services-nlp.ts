import { QueryHandle } from '../../types/general';

import { ProductScore } from './types';

import { compact } from '../../utils/general';
import { NlpServices } from '../nlp/services';
import { BusinessServices } from '../business/services';
import { PostServices } from '../post/services';

const getBusinessNLPKey = (routeName: string) => `_business_${routeName}`;
const getMarketPlaceNLPKey = () => '_marketPlaceKey';
const getProductIntent = (productName: string) => `productName.${productName}`;
const getProductIntentGetter = () => 'productName.{val}';

export class SearchServicesNLP {
  constructor(
    private readonly nlpServices: NlpServices,
    private readonly businessServices: BusinessServices,
    private readonly postServices: PostServices
  ) {}

  /**
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   * Searching
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   */

  searchInMarketplace: QueryHandle<{ search: string }, Array<ProductScore>> = async ({
    search
  }) => {
    const out = await this.nlpServices.getNlpMapping({
      text: search,
      key: getMarketPlaceNLPKey(),
      intentGetter: getProductIntentGetter()
    });

    return out.map(({ score, value }) => ({ productName: value, score }));
  };

  searchInBusiness: QueryHandle<{ search: string; routeName: string }, Array<ProductScore>> =
    async ({ search, routeName }) => {
      const out = await this.nlpServices.getNlpMapping({
        text: search,
        key: getBusinessNLPKey(routeName),
        intentGetter: getProductIntentGetter()
      });

      return out.map(({ score, value }) => ({ productName: value, score }));

      return [];
    };

  /**
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   * Training
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   */
  trainingMarketplace = async () => {
    const allProducts = await this.postServices.getAll({
      query: {
        hidden: false,
        hiddenBusiness: false
      }
    });

    await this.nlpServices.fetchFreeTrain({
      key: getMarketPlaceNLPKey(),
      dataSets: allProducts.map((product) => ({
        intent: getProductIntent(product.name),
        utterances: compact([product.name])
      }))
    });
  };

  trainingOneBusiness = async (routeName: string) => {
    const allProducts = await this.postServices.getAll({
      query: {
        routeName,
        hidden: false,
        hiddenBusiness: false
      }
    });

    await this.nlpServices.fetchFreeTrain({
      key: getBusinessNLPKey(routeName),
      dataSets: allProducts.map((product) => ({
        intent: getProductIntent(product.name),
        utterances: compact([product.name])
      }))
    });
  };

  trainingAllBusiness = async () => {
    const allBusinesses = await this.businessServices.getAll({
      query: {
        hidden: false
      }
    });

    const promises = allBusinesses.map(({ routeName }) => this.trainingOneBusiness(routeName));

    await Promise.all(promises);
  };
}
