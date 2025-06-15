import { BusinessType } from '../business/types';
import { Post, PostReviewSummary } from '../post/types';
import { Review } from '../review/types';
export interface PostDto extends Post {
    stockAmountAvailable: number | undefined;
    amountInProcess: number | undefined;
    businessType: BusinessType | undefined;
    businessName: string | undefined;
    businessAllowedOnlyCUPinCash: boolean | undefined;
    reviewSummary: PostReviewSummary | undefined;
    reviews: Array<Review> | undefined;
    hiddenToCustomers?: boolean;
}
