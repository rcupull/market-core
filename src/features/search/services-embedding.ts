import { QueryHandle } from '../../types/general';
import { compact, isEqualIds, line } from '../../utils/general';
import { CategoriesServices } from '../categories/services';
import { PostServices } from '../post/services';

import { EmbeddedProductScore } from './types';

const allProductsCollectionName = 'allProducts';

export class SearchServicesEmbeddings {
  constructor(
    private readonly postServices: PostServices,
    private readonly categoriesServices: CategoriesServices
  ) {}

  /**
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   * Searching
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   */

  searchInMarketplace: QueryHandle<
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

  searchSimilarProducts: QueryHandle<
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
      const { productId, vector } = productScore;
      const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
        vector,
        limit
      });

      return out
        .filter((s) => !isEqualIds(s.payload.productId, productId))
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
          .filter((s) => !isEqualIds(s.payload.productId, productId))
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

  /**
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   * Training
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   */

  trainingMarketplace: QueryHandle = async () => {
    const allCategories = await this.categoriesServices.getAll({ query: {} });
    const allSubCategories = allCategories.map(({ subCategories }) => subCategories).flat();

    await this.postServices.qdrantUpdateAllVectors(allProductsCollectionName, {
      query: {
        hidden: false,
        hiddenBusiness: false
      },
      getTextFromDoc: (post) => {
        const { description, name, categoryIds } = post;

        if (!description) return null;

        if (description.length < 50) return null;

        let out = `${line(5, name).join('.')}`;

        out = `${out}. ${description}`;

        if (categoryIds?.length) {
          const productSubcategories = allSubCategories.filter((sub) => {
            return categoryIds.some((id) => isEqualIds(id, sub._id));
          });

          out = `${out}. ${productSubcategories.map(({ label }) => label).join(',')}`;
        }

        return out;
      }
    });
  };
}
