import { ScoreElement, UserActivity } from './types';
import { modelGetter } from './schemas';
import { FilterQuery, Schema } from 'mongoose';

import { ModelDocument, QueryHandle } from '../../types/general';
import { isEqualIds } from '../../utils/general';
import { normalizeScores } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { WebTrackingServices } from '../web-tracking/services';
import { PostServices } from '../post/services';
import { Post } from '../post/types';

const globalIdentifier = 'globalActivity';

export class UserActivityServices extends ModelCrudTemplate<
  UserActivity,
  Pick<UserActivity, 'identifier' | 'products'>,
  FilterQuery<UserActivity>
> {
  constructor(
    private readonly webTrackingServices: WebTrackingServices,
    private readonly postServices: PostServices
  ) {
    super(modelGetter);
  }

  getUserActivity: QueryHandle<{ userId: Schema.Types.ObjectId }, ModelDocument<UserActivity>> =
    async ({ userId }) => {
      const userActivity = await this.getOne({
        query: {
          identifier: userId
        }
      });

      if (!userActivity) {
        return await this.addOne({
          identifier: userId.toString(),
          products: []
        });
      }

      return userActivity;
    };

  getGlobalActivity: QueryHandle<void, ModelDocument<UserActivity>> = async () => {
    const globalActivity = await this.getOne({
      query: {
        identifier: globalIdentifier
      }
    });

    if (!globalActivity) {
      return await this.addOne({
        identifier: globalIdentifier,
        products: []
      });
    }

    return globalActivity;
  };

  trainGlobal: QueryHandle = async () => {
    const posts = await this.postServices.getAll({ query: {} });

    const reviewScores = await this.getReviewScores({ posts });

    const globalActivity = await this.getGlobalActivity();

    const products = posts.map<ScoreElement>((post, index) => {
      let score = 0;

      /**
       * //////////////////////////////////////////////////////////////////////////////
       * add to score to product reviews
       * //////////////////////////////////////////////////////////////////////////////
       */
      const productReviewScore = reviewScores[index]?.score || 0;
      score = score + productReviewScore * 0.1;

      /**
       * //////////////////////////////////////////////////////////////////////////////
       * return
       * //////////////////////////////////////////////////////////////////////////////
       */

      return {
        productId: post._id,
        score
      };
    });

    globalActivity.products = normalizeScores(products);

    await globalActivity.save();
  };

  trainUser: QueryHandle<{ userId: Schema.Types.ObjectId }> = async ({ userId }) => {
    const userWebTrackings = await this.webTrackingServices.getAll({
      query: {
        userId
      }
    });

    const allProducts: Array<Pick<Post, '_id'>> = await this.postServices.getAll({
      query: {},
      projection: {
        _id: 1
      }
    });

    const userActivity = await this.getUserActivity({ userId });

    const products = allProducts.map<ScoreElement>((product) => {
      let score = 0;

      /**
       * //////////////////////////////////////////////////////////////////////////////
       * add to score if user clicked on product card and add to cart
       * //////////////////////////////////////////////////////////////////////////////
       */
      score = userWebTrackings.reduce((acc, { type, data }) => {
        if (data?.productId && isEqualIds(data?.productId, product._id)) {
          switch (type) {
            case 'page.main.addToCart.click':
            case 'page.business.addToCart.click':
            case 'page.product.addToCart.click':
            case 'page.product.related.addToCart.click':
              return acc + 0.4;
            case 'page.main.productCard.click':
            case 'page.business.productCard.click':
            case 'page.product.related.productCard.click':
              return acc + 0.2;
            default:
              return acc;
          }
        }

        return acc;
      }, score);

      /**
       * //////////////////////////////////////////////////////////////////////////////
       * return
       * //////////////////////////////////////////////////////////////////////////////
       */

      return {
        productId: product._id,
        score
      };
    });

    userActivity.products = normalizeScores(products);

    await userActivity.save();
  };

  getReviewScores: QueryHandle<
    {
      posts: Array<Post>;
    },
    Array<ScoreElement>
  > = async ({ posts }) => {
    const { getReviews } = await this.postServices.getReviewsData({ posts });

    const reviewScores = posts.map<ScoreElement>((post) => {
      const { reviews } = getReviews(post);

      const score = (() => {
        if (!reviews?.length) return 0;

        const acc = reviews?.reduce((acc, { star = 0 }) => acc + star, 0);
        const mean = acc / reviews.length;
        return mean;
      })();

      return {
        productId: post._id,
        score
      };
    });

    return normalizeScores(reviewScores);
  };
}
