import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { modelGetter } from './schemas';
import { Review } from './types';

import { GetAllReviewArgs, getAllFilterQuery } from './utils';

export class ReviewServices extends ModelCrudTemplate<
  Review,
  Pick<Review, 'reviewerId' | 'comment' | 'star' | 'postId'>,
  GetAllReviewArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }
}
