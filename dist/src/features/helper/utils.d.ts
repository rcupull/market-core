import { FilterQuery } from 'mongoose';
import { Helper } from './types';
export interface GetAllHelpersArgs extends FilterQuery<Helper> {
    search?: string;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllHelpersArgs>) => FilterQuery<GetAllHelpersArgs>;
export declare const getHelperSlugFromTitle: (name: string) => string;
