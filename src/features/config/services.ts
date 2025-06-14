import { FilterQuery, ProjectionType, UpdateQuery } from 'mongoose';
import { ModelDocument, QueryHandle } from '../../types/general';
import { AdminConfig } from './types';
import { modelGetter } from './schemas';
import { CommissionMode, Commissions } from '../../types/commision';
import { deepJsonCopy, get, mergeDeep } from '../../utils/general';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { BusinessServices } from '../business/services';
import { Post } from '../post/types';
import { Business, BusinessType } from '../business/types';

const defaultProductsCommissions: Commissions = {
  marketOperation: {
    mode: CommissionMode.PERCENT,
    value: 0
  },
  systemUse: {
    mode: CommissionMode.PERCENT,
    value: 0
  }
};

const defaultDeliveryCommissions: Commissions = {
  marketOperation: {
    mode: CommissionMode.PERCENT,
    value: 0
  },
  systemUse: {
    mode: CommissionMode.PERCENT,
    value: 0
  }
};

export class ConfigServices extends ModelCrudTemplate<
  AdminConfig,
  never,
  FilterQuery<AdminConfig>
> {
  constructor(private readonly businessServices: BusinessServices) {
    super(modelGetter);
  }

  adminConfigServicesGetOne: QueryHandle<
    {
      projection?: ProjectionType<AdminConfig>;
    },
    ModelDocument<AdminConfig> | null
  > = async ({ projection }) => {
    const out = await this.getOne({
      query: {},
      projection
    });

    return out;
  };

  adminConfigServicesUpdateOne: QueryHandle<{
    update: UpdateQuery<AdminConfig>;
  }> = async ({ update }) => {
    await this.updateOne({
      query: {},
      update
    });
  };

  adminConfigExangesRatesUtils: QueryHandle<
    void,
    {
      getCommissionsForProduct: (post: Post) => {
        commissions: Commissions;
      };
      getCommissionsForDelivery: (args: {
        routeName: string | undefined;
        businessType: BusinessType | undefined;
      }) => {
        commissions: Commissions;
      };
    }
  > = async () => {
    const businessData: Array<
      Pick<Business, 'routeName' | 'businessType' | 'commissions' | 'customCommissions'>
    > = await this.businessServices.getAll({
      query: {},
      projection: {
        routeName: 1,
        businessType: 1,
        commissions: 1,
        customCommissions: 1
      }
    });

    const configData: Pick<AdminConfig, 'commissions'> | null =
      await this.adminConfigServicesGetOne({
        projection: {
          commissions: 1
        }
      });

    /**
     * Get values dynamically from admin or other place
     */

    return {
      getCommissionsForProduct: (post) => {
        const { businessType, commissions, customCommissions } =
          businessData.find((b) => b.routeName === post.routeName) || {};
        const getDefaultComissions = () => {
          if (!configData) return {};
          if (!businessType) return {};

          return get(configData, `commissions.products.${businessType}`) || {};
        };

        const getBusinessComissions = () => {
          return commissions?.products || {};
        };

        const getCommissionObj = customCommissions ? getBusinessComissions : getDefaultComissions;

        return {
          commissions: mergeDeep(defaultProductsCommissions, deepJsonCopy(getCommissionObj()))
        };
      },
      getCommissionsForDelivery: ({ businessType, routeName }) => {
        const { commissions, customCommissions } =
          businessData.find((b) => b.routeName === routeName) || {};

        const getDefaultComissions = () => {
          if (!configData) return {};
          if (!businessType) return {};

          return get(configData, `commissions.delivery.${businessType}`) || {};
        };

        const getBusinessComissions = () => {
          return commissions?.delivery || {};
        };

        const getCommissionObj = customCommissions ? getBusinessComissions : getDefaultComissions;
        return {
          commissions: mergeDeep(defaultDeliveryCommissions, deepJsonCopy(getCommissionObj()))
        };
      }
    };
  };

  adminConfigServicesGetDeliveryConfig = async () => {
    const adminConfig = (await this.adminConfigServicesGetOne({
      projection: {
        deliveryConfig: 1,
        addresses: 1
      }
    })) as ModelDocument<Pick<AdminConfig, 'deliveryConfig' | 'addresses'>> | null;

    const addresses = adminConfig?.addresses || [];

    return {
      adminDeliveryConfig: adminConfig?.deliveryConfig,
      /**
       * The marketplace address to pickup the shopping
       */
      marketAddress: addresses.length ? addresses[addresses.length - 1] : undefined
    };
  };

  features = async () => {
    const adminConfig = (await this.adminConfigServicesGetOne({
      projection: {
        features: 1
      }
    })) as ModelDocument<Pick<AdminConfig, 'features'>> | null;

    return {
      getEnabledFeature: (featureKey: string) => {
        return (
          adminConfig?.features?.find((feature) => feature.key === featureKey)?.enabled ?? false
        );
      }
    };
  };
}
