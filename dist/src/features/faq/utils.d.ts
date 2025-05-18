import { FilterQuery } from 'mongoose';
import { Faq } from './types';
export interface GetAllFaqsArgs extends FilterQuery<Faq> {
    search?: string;
    questionSuggestions?: Array<string>;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllFaqsArgs>) => FilterQuery<GetAllFaqsArgs>;
