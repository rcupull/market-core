import { QueryHandle } from '../../types/general';

import { ProductScore } from '../search/types';

import { ConfigServices } from '../config/services';
import { SearchEmbeddingSuggestionServices } from './services-embedding';

export class SearchSuggestionServices {
  constructor(
    private readonly configServices: ConfigServices,
    private readonly searchEmbeddingSuggestionServices: SearchEmbeddingSuggestionServices
  ) {}

  searchSuggestionProducts: QueryHandle<
    { search: string | undefined },
    {
      productScores: Array<ProductScore>;
      similarProductScores: Array<ProductScore>;
    }
  > = async ({ search }) => {
    if (!search) {
      return {
        productScores: [],
        similarProductScores: []
      };
    }

    const { getEnabledFeature } = await this.configServices.features();


    if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
      const products = await this.searchEmbeddingSuggestionServices.searchSuggestionProducts({
        search,
        limit: 1
      });

      const similar = await Promise.all(
        products.map((productScore) => {
          return this.searchEmbeddingSuggestionServices.searchSimilarSuggestionProducts({
            productScore,
            limit: 20
          });
        })
      );

      return {
        productScores: products.map(({ productName, score }) => ({ score, productName })),
        similarProductScores: similar.flat().map(({ productName, score }) => ({
          score,
          productName
        }))
      };
    }

    return {
      productScores: [],
      similarProductScores: []
    };
  };
  trainingSearchSuggestions: QueryHandle = async () => {
    const { getEnabledFeature } = await this.configServices.features();

    if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
      return await this.searchEmbeddingSuggestionServices.trainingSearchSuggestions();
    }

    return;
  };
}
