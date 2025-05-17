import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Review } from './types';
import { GetAllReviewArgs } from './utils';
export declare class ReviewServices extends ModelCrudTemplate<Review, Pick<Review, 'reviewerId' | 'comment' | 'star' | 'postId'>, GetAllReviewArgs> {
    constructor();
}
