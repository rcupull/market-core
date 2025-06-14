import { Schema } from 'mongoose';
import { Currency, ModelDocument, QueryHandle } from '../../types/general';
import { modelGetter } from './schemas';
import { GetAllPostArgs, Post, PostReviewDto, PostReviewSummary } from './types';

import { getAllFilterQuery, getPostSlugFromName } from './utils';
import { deepJsonCopy, isEqualIds, isNumber } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';

import { ModelCrudWithQdrant, ModelCrudWithQdrantOptions } from '../../utils/ModelCrudWithQdrant';
import { User } from '../user/types';
import { UserServices } from '../user/services';
import { ReviewServices } from '../review/services';
import { ShoppingPostData } from '../shopping/types';
import { ConfigServices } from '../config/services';
import { AdminConfig } from '../config/types';
import { getConvertedPrice } from '../../utils/price';
import { PostDto } from '../post-dtos/types';

interface PostQdrantPayload {
  productId: string;
  productName: string;
}

export class PostServices extends ModelCrudWithQdrant<
  Post,
  Pick<
    Post,
    | 'hidden'
    | 'hiddenBusiness'
    | 'description'
    | 'images'
    | 'price'
    | 'currency'
    | 'currenciesOfSale'
    | 'routeName'
    | 'name'
    | 'postSlug'
    | 'clothingSizes'
    | 'colors'
    | 'details'
    | 'highlights'
    | 'createdBy'
    | 'postCategoriesLabels'
    | 'categoryIds'
    | 'postType'
    | 'postLink'
    | 'discount'
  >,
  GetAllPostArgs,
  PostQdrantPayload
> {
  constructor(
    private readonly userServices: UserServices,
    private readonly reviewServices: ReviewServices,
    private readonly configServices: ConfigServices,
    options: ModelCrudWithQdrantOptions<Post, PostQdrantPayload>
  ) {
    super(modelGetter, getAllFilterQuery, options);
  }

  getPostSlugFromName: typeof getPostSlugFromName = (name) => getPostSlugFromName(name);

  changeStock: QueryHandle<
    {
      postId: Schema.Types.ObjectId;
      amount: number;
      updatedByUser?: Schema.Types.ObjectId;
      updatedByShopping?: Schema.Types.ObjectId;
    },
    ModelDocument<Post> | null
  > = async ({ postId, amount, updatedByShopping, updatedByUser }) => {
    const out = await this.findOneAndUpdate({
      query: {
        _id: postId
      },
      update: {
        $inc: {
          stockAmount: amount
        },
        $push: {
          stockAmountHistory: {
            amount,
            updatedAt: new Date(),
            updatedByUser,
            updatedByShopping
          }
        }
      }
    });

    return out;
  };

  getReviewsData: QueryHandle<
    {
      posts: Array<Post>;
    },
    {
      getReviews: (post: Post) => { reviews: Array<PostReviewDto> };
    }
  > = async ({ posts }) => {
    const allReviews = await this.reviewServices.getAll({
      query: {
        postId: getInArrayQuery(posts.map(({ _id }) => _id))
      }
    });

    const allReviewers: Array<Pick<User, 'name' | '_id'>> = await this.userServices.getAll({
      query: {
        _id: getInArrayQuery(allReviews.map(({ reviewerId }) => reviewerId))
      },
      projection: {
        name: 1,
        _id: 1
      }
    });

    return {
      getReviews: (post) => {
        const postReviews = allReviews.filter((review) => isEqualIds(review.postId, post._id));

        const reviews = postReviews.map<PostReviewDto>((review) => {
          const { reviewerId } = review;
          const reviewer = allReviewers.find(({ _id }) => isEqualIds(_id, reviewerId));

          return {
            ...deepJsonCopy(review),
            reviewerName: reviewer?.name
          };
        });

        return { reviews };
      }
    };
  };

  getReviewSummaryData: QueryHandle<
    {
      posts: Array<Post>;
    },
    {
      getReviewSummary: (post: Post) => { reviewSummary: PostReviewSummary };
    }
  > = async ({ posts }) => {
    const allReviews = await this.reviewServices.getAll({
      query: {
        postId: getInArrayQuery(posts.map(({ _id }) => _id))
      }
    });

    return {
      getReviewSummary: (post) => {
        const postReviews = allReviews.filter((review) => isEqualIds(review.postId, post._id));

        const reviewSummary: PostReviewSummary = {
          starSummary: [0, 0, 0, 0, 0],
          reviewerIds: []
        };

        postReviews.forEach(({ star, reviewerId }) => {
          if (isNumber(star)) {
            reviewSummary.starSummary[star - 1] += 1;
          }

          reviewSummary.reviewerIds.push(reviewerId.toString());
        });

        return { reviewSummary };
      }
    };
  };

  useGetCopyAndFlattenPost = async () => {
    const { getEnabledFeature } = await this.configServices.features();

    /**
     * TODO improve this query
     */
    const config: Pick<AdminConfig, 'exchangeRates'> | null =
      await this.configServices.adminConfigServicesGetOne({
        projection: {
          exchangeRates: 1
        }
      });

    const getCopyAndFlattenPost = (
      post: Post,
      options: {
        transformCurrenciesOfSale: boolean;
        transformCurrencyAndPrice: boolean;
      }
    ): PostDto => {
      const { transformCurrenciesOfSale, transformCurrencyAndPrice } = options || {};

      const out: PostDto = {
        ...deepJsonCopy(post),
        amountInProcess: undefined,
        reviews: undefined,
        stockAmountAvailable: undefined,
        reviewSummary: undefined,
        businessType: undefined,
        businessName: undefined,
        businessAllowedOnlyCUPinCash: undefined
      };
      if (transformCurrenciesOfSale) {
        /**
         * ////////////////////////////////////////////////////////////////
         * Remove USD from currencies of sale if the feature is disabled
         * ////////////////////////////////////////////////////////////////
         */

        if (
          !getEnabledFeature('ALLOW_PAYMENT_USD') &&
          out.currenciesOfSale?.includes(Currency.USD)
        ) {
          out.currenciesOfSale = out.currenciesOfSale.filter((c) => c !== Currency.USD);
        }

        /**
         * ////////////////////////////////////////////////////////////////
         * Remove MLC from currencies of sale if the feature is disabled
         * ////////////////////////////////////////////////////////////////
         */

        if (
          !getEnabledFeature('ALLOW_PAYMENT_TRANSFERMOVIL_MLC') &&
          out.currenciesOfSale?.includes(Currency.MLC)
        ) {
          out.currenciesOfSale = out.currenciesOfSale.filter((c) => c !== Currency.MLC);
        }
      }

      if (transformCurrencyAndPrice) {
        /**
         * ////////////////////////////////////////////////////////////
         * Transform price to the first currency of sale if the feature is enabled
         * ////////////////////////////////////////////////////////////
         */

        if (!getEnabledFeature('ALLOW_PAYMENT_USD') && out.currency === Currency.USD) {
          const newCurrency = (() => {
            if (out.currenciesOfSale?.includes(Currency.MLC)) {
              return Currency.MLC;
            }

            if (out.currenciesOfSale?.includes(Currency.CUP)) {
              return Currency.CUP;
            }

            return null;
          })();

          if (newCurrency) {
            out.price = getConvertedPrice({
              price: out.price || 0,
              currentCurrency: out.currency,
              desiredCurrency: newCurrency,
              exchangeRates: config?.exchangeRates
            });

            out.currency = newCurrency;
          } else {
            out.hiddenToCustomers = true;
          }
        }

        if (
          !getEnabledFeature('ALLOW_PAYMENT_TRANSFERMOVIL_MLC') &&
          out.currency === Currency.MLC
        ) {
          const newCurrency = (() => {
            if (out.currenciesOfSale?.includes(Currency.USD)) {
              return Currency.USD;
            }

            if (out.currenciesOfSale?.includes(Currency.CUP)) {
              return Currency.CUP;
            }

            return null;
          })();

          if (newCurrency) {
            out.price = getConvertedPrice({
              price: out.price || 0,
              currentCurrency: out.currency,
              desiredCurrency: newCurrency,
              exchangeRates: config?.exchangeRates
            });

            out.currency = newCurrency;
          } else {
            out.hiddenToCustomers = true;
          }
        }
      }

      /**
       * ////////////////////////////////////////////////////////////////
       * ////////////////////////////////////////////////////////////////
       * ////////////////////////////////////////////////////////////////
       */
      return out;
    };

    return {
      getCopyAndFlattenPost
    };
  };

  getPostDataToShopping: QueryHandle<
    {
      post: Post;
    },
    ShoppingPostData
  > = async ({ post }) => {
    const { getCommissionsForProduct } = await this.configServices.adminConfigExangesRatesUtils();

    const { getCopyAndFlattenPost } = await this.useGetCopyAndFlattenPost();

    const { _id, price, images, routeName, name, currency, currenciesOfSale } =
      getCopyAndFlattenPost(post, {
        transformCurrenciesOfSale: true,
        transformCurrencyAndPrice: true
      });

    const { commissions } = getCommissionsForProduct(post);

    return {
      _id,
      name,
      routeName,
      images,
      //
      salePrice: price || 0,
      currency,
      currenciesOfSale,
      //
      commissions
    };
  };
}
