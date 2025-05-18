import { ScoreElement, UserActivity } from './types';
import { FilterQuery, Schema } from 'mongoose';
import { ModelDocument, QueryHandle } from '../../types/general';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { WebTrackingServices } from '../web-tracking/services';
import { PostServices } from '../post/services';
import { Post } from '../post/types';
export declare class UserActivityServices extends ModelCrudTemplate<UserActivity, Pick<UserActivity, 'identifier' | 'products'>, FilterQuery<UserActivity>> {
    private readonly webTrackingServices;
    private readonly postServices;
    constructor(webTrackingServices: WebTrackingServices, postServices: PostServices);
    getUserActivity: QueryHandle<{
        userId: Schema.Types.ObjectId;
    }, ModelDocument<UserActivity>>;
    getGlobalActivity: QueryHandle<void, ModelDocument<UserActivity>>;
    trainGlobal: QueryHandle;
    trainUser: QueryHandle<{
        userId: Schema.Types.ObjectId;
    }>;
    getReviewScores: QueryHandle<{
        posts: Array<Post>;
    }, Array<ScoreElement>>;
}
