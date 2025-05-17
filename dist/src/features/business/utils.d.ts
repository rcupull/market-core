import { Business } from './types';
import { FilterQuery, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
export interface GetAllBusinessArgs extends FilterQuery<Business> {
    routeNames?: Array<string>;
    search?: string;
    hidden?: boolean;
}
export type UpdateQueryBusiness = UpdateQuery<Partial<Pick<Business, 'hidden' | 'socialLinks' | 'bannerImages' | 'name' | 'routeName' | 'logo' | 'layouts' | 'postCategories' | 'aboutUsPage' | 'aboutUsPage'>>> | UpdateWithAggregationPipeline;
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllBusinessArgs>) => FilterQuery<GetAllBusinessArgs>;
