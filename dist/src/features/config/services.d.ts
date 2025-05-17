import { FilterQuery, ProjectionType, UpdateQuery } from 'mongoose';
import { ModelDocument, QueryHandle } from '../../types/general';
import { AdminConfig, FeatureKey } from './types';
import { Commissions } from '../../types/commision';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { BusinessServices } from '../business/services';
import { Post } from '../post/types';
import { BusinessType } from '../business/types';
export declare class ConfigServices extends ModelCrudTemplate<AdminConfig, never, FilterQuery<AdminConfig>> {
    private readonly businessServices;
    constructor(businessServices: BusinessServices);
    adminConfigServicesGetOne: QueryHandle<{
        projection?: ProjectionType<AdminConfig>;
    }, ModelDocument<AdminConfig> | null>;
    adminConfigServicesUpdateOne: QueryHandle<{
        update: UpdateQuery<AdminConfig>;
    }>;
    adminConfigExangesRatesUtils: QueryHandle<void, {
        getCommissionsForProduct: (post: Post) => {
            commissions: Commissions;
        };
        getCommissionsForDelivery: (args: {
            routeName: string | undefined;
            businessType: BusinessType | undefined;
        }) => {
            commissions: Commissions;
        };
    }>;
    adminConfigServicesGetDeliveryConfig: () => Promise<{
        adminDeliveryConfig: import("../business/types").DeliveryConfig | undefined;
        /**
         * The marketplace address to pickup the shopping
         */
        marketAddress: import("../../types/general").Address | undefined;
    }>;
    features: () => Promise<{
        getEnabledFeature: (featureKey: FeatureKey) => boolean;
    }>;
}
