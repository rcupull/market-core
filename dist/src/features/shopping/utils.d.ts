import { GetAllShoppingArgs } from './types';
import { Commission } from '../../types/commision';
export declare const getAllFilterQuery: (filterQuery: import("mongoose").FilterQuery<GetAllShoppingArgs>) => import("mongoose").FilterQuery<GetAllShoppingArgs>;
export declare const getShoppingCode: () => string;
export declare const getCommissionPrice: (comission: Commission, price: number) => number;
