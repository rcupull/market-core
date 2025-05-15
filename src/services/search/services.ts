import { AnyRecord, QueryHandle } from '../../types/general';
import { PostServices } from '../post/services';
import { Post } from '../post/types';

import { getInArrayQuery } from '../../utils/schemas';
import { ShoppingServices } from '../shopping/services';
import { BusinessServices } from '../business/services';
import { NlpSearchReturnType, ProductScore, SearchDto, SearchPostDto } from './types';
import { ConfigServices } from '../config/services';
import { FeatureKey } from '../config/types';
import { ProductSimilarityServices } from '../product-similarity/services';
import { SearchServicesNLP } from './services-nlp';
import { SearchServicesEmbeddings } from './services-embedding';

export class SearchServices {
  constructor(
    private readonly shoppingServices: ShoppingServices,
    private readonly businessServices: BusinessServices,
    private readonly postServices: PostServices,
    private readonly configServices: ConfigServices,
    private readonly productSimilarityServices: ProductSimilarityServices,
    private readonly searchServicesNLP: SearchServicesNLP,
    private readonly searchServicesEmbeddings: SearchServicesEmbeddings
  ) {}

  searchInMarketplace: QueryHandle<
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

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */
    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_NLP)) {
      const productScores = await this.searchServicesNLP.searchInMarketplace({ search });

      return {
        productScores,
        similarProductScores: await (async () => {
          if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_PRODUCT_SIMILARITY)) {
            const out = await this.productSimilarityServices.getAll({
              query: {
                productName: getInArrayQuery(productScores.map(({ productName }) => productName))
              }
            });

            return out.map(({ productScores }) => productScores).flat();
          }

          return [];
        })()
      };
    }

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_EMBEDDING)) {
      const products = await this.searchServicesEmbeddings.searchInMarketplace({
        search,
        limit: 1
      });

      const similar = await Promise.all(
        products.map((productScore) => {
          return this.searchServicesEmbeddings.searchSimilarProducts({
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

  getRelatedToProductMapping: QueryHandle<
    { postId: string },
    {
      similarProductScores: Array<ProductScore>;
    }
  > = async ({ postId }) => {
    const { getEnabledFeature } = await this.configServices.features();

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */
    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_NLP)) {
      const productScores = await this.productSimilarityServices.getOne({
        query: {
          productId: postId
        }
      });

      const similarityProducts = await this.productSimilarityServices.getAll({
        query: {
          productName: getInArrayQuery(
            (productScores?.productScores || []).map(({ productName }) => productName)
          )
        }
      });

      const similarProductScores = similarityProducts
        .map(({ productScores }) => productScores)
        .flat();

      return {
        similarProductScores
      };
    }

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_EMBEDDING)) {
      const similar = await this.searchServicesEmbeddings.searchSimilarProducts({
        productId: postId
      });

      return {
        similarProductScores: similar.map(({ productName, score }) => ({
          score,
          productName
        }))
      };
    }

    return {
      similarProductScores: []
    };
  };

  searchInBusiness: QueryHandle<
    { search: string | undefined; routeName: string },
    {
      productScores: Array<ProductScore>;
    }
  > = async ({ search, routeName }) => {
    if (!search) {
      return {
        productScores: [],
        similarProductScores: []
      };
    }
    const { getEnabledFeature } = await this.configServices.features();

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */
    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_NLP)) {
      const productScores = await this.searchServicesNLP.searchInBusiness({
        search,
        routeName
      });

      return {
        productScores,
        similarProductScores: []
      };
    }

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_EMBEDDING)) {
      return {
        productScores: [],
        similarProductScores: []
      };

      /**
       * DEVELOPING
       */

      // const out = await this.productEmbeddingServices.search({ text: search, topK: 5 });

      // const out = await this.embeddingServices.searchProducts({ search });

      // return out.map(({ productName, score }) => ({
      //   score,
      //   productName
      // }));
    }

    return {
      productScores: [],
      similarProductScores: []
    };
  };

  trainingMarketplace: QueryHandle = async () => {
    const { getEnabledFeature } = await this.configServices.features();

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_NLP)) {
      return await this.searchServicesNLP.trainingMarketplace();
    }

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_EMBEDDING)) {
      return await this.searchServicesEmbeddings.trainingMarketplace();
    }

    return;
  };

  trainingOneBusiness = async (routeName: string) => {
    const { getEnabledFeature } = await this.configServices.features();

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_NLP)) {
      return await this.searchServicesNLP.trainingOneBusiness(routeName);
    }

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_EMBEDDING)) {
      //TODO
      return;
    }

    return;
  };

  trainingAllBusiness = async () => {
    const { getEnabledFeature } = await this.configServices.features();

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_NLP)) {
      return await this.searchServicesNLP.trainingAllBusiness();
    }

    if (getEnabledFeature(FeatureKey.MAIN_SEARCH_USING_EMBEDDING)) {
      //TODO
      return;
    }

    return;
  };

  getSearchDto = async (data: Array<Post>): Promise<Array<SearchDto>> => {
    const isPost = (value: AnyRecord): value is Post => !!value.postType;

    /**
     * ////////////////////////////////////////////////////////////////
     */

    const { getPostData } = await this.shoppingServices.getDataFromPosts({
      posts: data.filter(isPost)
    });

    const { getOnePostBusinessData } = await this.businessServices.getBusinessDataFrom({
      query: {
        routeName: getInArrayQuery(data.map(({ routeName }) => routeName))
      }
    });

    const { getCopyAndFlattenPost } = await this.postServices.useGetCopyAndFlattenPost();

    const { getReviewSummary } = await this.postServices.getReviewSummaryData({
      posts: data
    });

    const getSearchPostDto = async (post: Post): Promise<SearchPostDto> => {
      const { stockAmountAvailable } = getPostData(post);
      const { reviewSummary } = getReviewSummary(post);

      const { businessType, businessName, businessAllowedOnlyCUPinCash } =
        getOnePostBusinessData(post);

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

    const out = await Promise.all(data.map(getSearchPostDto));

    return out;
  };
}
