import { FilterQuery } from 'mongoose';
import { Post } from './types';
export interface GetAllPostArgs extends FilterQuery<Post> {
    routeNames?: Array<string>;
    postsIds?: Array<string>;
    search?: string;
    postCategoriesLabels?: Array<string>;
    postCategoriesMethod?: 'some' | 'every';
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllPostArgs>) => FilterQuery<GetAllPostArgs>;
export declare const getPostSlug: (name: string) => string;
