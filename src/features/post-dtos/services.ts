import { getInArrayQuery } from '../../utils/schemas';
import { BusinessServices } from '../business/services';
import { PostServices } from '../post/services';
import { Post } from '../post/types';
import { ShoppingServices } from '../shopping/services';
import { PostDto } from './types';

export class PostDtosServices {
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

  getPostsDto = async (posts: Array<Post>): Promise<Array<PostDto>> => {
    const {
      getCopyAndFlattenPost,
      getOneBusinessData,
      getOnePostShoppingData,
      getReviewSummary,
      getReviews
    } = await this.getPostsResources(posts);

    const getPostDto = async (post: Post): Promise<PostDto> => {
      const { stockAmountAvailable } = getOnePostShoppingData(post);
      const { reviewSummary } = getReviewSummary(post);
      const { reviews } = getReviews(post);
      const { businessType, businessName } = getOneBusinessData({
        routeName: post.routeName
      });

      return {
        ...getCopyAndFlattenPost(post, {
          transformCurrenciesOfSale: true,
          transformCurrencyAndPrice: true
        }),
        stockAmountAvailable,
        businessType,
        businessName,
        reviewSummary,
        reviews
      };
    };

    const promises = posts.map(getPostDto);
    const out = await Promise.all(promises);

    return out;
  };

  getPostsOwnerDto = async (posts: Array<Post>): Promise<Array<PostDto>> => {
    const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData } =
      await this.getPostsResources(posts);

    const getPostDto = async (post: Post): Promise<PostDto> => {
      const { amountInProcess, stockAmountAvailable, stockAmount } = getOnePostShoppingData(post);
      const { businessType } = getOneBusinessData({
        routeName: post.routeName
      });

      return {
        ...getCopyAndFlattenPost(post, {
          transformCurrenciesOfSale: false,
          transformCurrencyAndPrice: false
        }),
        stockAmount,
        stockAmountAvailable,
        amountInProcess,
        businessType
      };
    };

    const promises = posts.map(getPostDto);
    const out = await Promise.all(promises);

    return out;
  };
}
