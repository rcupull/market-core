import { Business, BusinessType, DeliveryConfig } from './types';
import { GetAllBusinessArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Address, Currency, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
export declare class BusinessServices extends ModelCrudTemplate<Business, Pick<Business, 'createdBy' | 'routeName' | 'name'>, GetAllBusinessArgs> {
    constructor();
    getBusinessDataFrom: QueryHandle<{
        query: GetAllBusinessArgs;
    }, {
        getOneBusinessData: (args: {
            routeName: string | undefined;
        }) => {
            businessName: string | undefined;
            businessAddress: Address | undefined;
            businessType: BusinessType | undefined;
            businessDeliveryConfig: DeliveryConfig | undefined;
            businessCurrency: Currency | undefined;
            businessAllowedOnlyCUPinCash: boolean | undefined;
            businessTermsAndConditions: string | undefined;
        };
    }>;
    getBusinessFavoritesData: QueryHandle<{
        query: GetAllBusinessArgs;
    }, {
        getFavoritesBusiness: (args: {
            userId: Schema.Types.ObjectId;
        }) => Array<{
            name: string;
            routeName: string;
        }>;
    }>;
}
