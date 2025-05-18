import { Schema } from 'mongoose';
import { ModelDocument, QueryHandle } from '../../types/general';
import { modelGetter } from './schemas';
import { GetAllPostArgs, Post, PostReviewDto, PostReviewSummary } from './types';

import { getAllFilterQuery, getPostSlugFromName } from './utils';
import { deepJsonCopy, isEqualIds, isNumber } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';

import { ModelCrudWithQdrant, ModelCrudWithQdrantOptions } from '../../utils/ModelCrudWithQdrant';
import { User } from '../user/types';
import { UserServices } from '../user/services';
import { ReviewServices } from '../review/services';

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
}
