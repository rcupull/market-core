import { ReviewModel } from './schemas';
import { Review } from './types';

import { GetAllReviewArgs, getAllFilterQuery } from './utils';

import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class ReviewServices extends ModelCrudTemplate<
  Review,
  Pick<Review, 'reviewerId' | 'comment' | 'star' | 'postId'>,
  GetAllReviewArgs
> {
  constructor() {
    super(ReviewModel, getAllFilterQuery);
  }
}
