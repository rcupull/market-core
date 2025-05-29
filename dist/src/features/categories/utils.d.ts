import { FilterQuery } from 'mongoose';
import { Category } from './types';
export interface GetAllCategoriesArgs extends FilterQuery<Category> {
    search?: string;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllCategoriesArgs>) => FilterQuery<GetAllCategoriesArgs>;
export declare const getCategorySlugFromLabel: (name: string) => string;
