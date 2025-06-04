import { QueryHandle } from '../../types/general';
import { line, compact } from '../../utils/general';
import { EmbeddedProductScore } from '../search/types';


import { PostServices } from '../post/services';

const allProductsCollectionName = 'allProductsSearchSuggestions';

export class SearchEmbeddingSuggestionServices {
  constructor(
    private readonly postServices: PostServices
  ) {}

  searchSuggestionProducts: QueryHandle<
    { search: string; limit?: number },
    Array<EmbeddedProductScore>
  > = async ({ search, limit }) => {
    const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
      search,
      limit
    });

    return out.map(({ score, payload, vector }) => ({
      score,
      vector,
      productName: payload.productName,
      productId: payload.productId
    }));
  };

  searchSimilarSuggestionProducts: QueryHandle<
    {
      productScore?: EmbeddedProductScore;
      productId?: string;
      limit?: number;
    },
    Array<EmbeddedProductScore>
  > = async ({ productScore, limit, productId }) => {
    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * searchin similar producst using vectors
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */
    if (productScore) {
      const { vector } = productScore;
      const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
        vector,
        limit
      });

      return out
        .map((s) => ({
          score: s.score,
          vector: s.vector,
          productName: s.payload.productName,
          productId: s.payload.productId
        }));
    }

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * searchin similar products using postIds
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */
    if (productId) {
      const point = await this.postServices.qdrantSearchOne(allProductsCollectionName, {
        query: { productId }
      });

      if (point) {
        const { vector } = point;

        const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
          vector,
          limit
        });

        return compact(out)
          .map((s) => ({
            score: s.score,
            vector: s.vector,
            productName: s.payload.productName,
            productId: s.payload.productId
          }));
      }
    }

    return [];
  };

  trainingSearchSuggestions: QueryHandle = async () => {

  await this.postServices.qdrantUpdateAllVectors(allProductsCollectionName, {
    query: {
      hidden: false,
      hiddenBusiness: false
    },
    getTextFromDoc: (post) => {
    const { name } = post;
    
    if (!name) return null;

    let out = `${line(5, name).join('.')}`;
    
    out = `${out}`;
    
    return out;
    }
  });
  }
}