import { getInArrayQuery } from '../../utils/schemas';
import { BusinessServices } from '../business/services';
import { PostServices } from '../post/services';
import { Post } from '../post/types';
import { ShoppingServices } from '../shopping/services';
import { NlpSearchReturnType, SearchDto, SearchPostDto } from './types';

export class SearchDtosServices {
  constructor(
    private readonly businessServices: BusinessServices,
    private readonly shoppingServices: ShoppingServices,
    private readonly postServices: PostServices
  ) {}

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
}
