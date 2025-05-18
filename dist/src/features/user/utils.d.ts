import { FilterQuery } from 'mongoose';
import { User } from './types';
export interface GetAllUsersArgs extends FilterQuery<User> {
    search?: string;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllUsersArgs>) => FilterQuery<GetAllUsersArgs>;
export declare const MARKET = "market";
