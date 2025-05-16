import { FilterQuery } from 'mongoose';
import { ApiTracking } from './types';
export interface GetAllApiTrackingArgs extends FilterQuery<ApiTracking> {
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllApiTrackingArgs>) => FilterQuery<GetAllApiTrackingArgs>;
