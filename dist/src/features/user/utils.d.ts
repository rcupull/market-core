import { FilterQuery } from 'mongoose';
import { User } from './types';
export interface GetAllUsersArgs extends FilterQuery<User> {
    search?: string;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllUsersArgs>) => FilterQuery<GetAllUsersArgs>;
export declare const MARKET = "market";
export declare const getUserAddress: (user: User, addressIndex?: number) => import("../../types/general").Address | undefined;
