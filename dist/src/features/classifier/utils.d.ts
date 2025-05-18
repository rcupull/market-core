import { FilterQuery } from 'mongoose';
import { Classifier } from './types';
export interface GetAllClassifiersArgs extends FilterQuery<Classifier> {
    search?: string;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllClassifiersArgs>) => FilterQuery<GetAllClassifiersArgs>;
