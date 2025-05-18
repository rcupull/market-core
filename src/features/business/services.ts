import { Business, BusinessType, DeliveryConfig } from './types';
import { modelGetter } from './schemas';

import { GetAllBusinessArgs, getAllFilterQuery } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Address, Currency, QueryHandle } from '../../types/general';

export class BusinessServices extends ModelCrudTemplate<
  Business,
  Pick<Business, 'createdBy' | 'routeName' | 'name'>,
  GetAllBusinessArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }

  getBusinessDataFrom: QueryHandle<
    {
      query: GetAllBusinessArgs;
    },
    {
      getOneBusinessData: (args: { routeName: string | undefined }) => {
        businessName: string | undefined;
        businessAddress: Address | undefined;
        businessType: BusinessType | undefined;
        businessDeliveryConfig: DeliveryConfig | undefined;
        businessCurrency: Currency | undefined;
        businessAllowedOnlyCUPinCash: boolean | undefined;
        businessTermsAndConditions: string | undefined;
      };
    }
  > = async ({ query }) => {
    const businessData: Array<
      Pick<
        Business,
        | 'name'
        | 'routeName'
        | 'addresses'
        | 'businessType'
        | 'currency'
        | 'deliveryConfig'
        | 'shoppingMeta'
        | 'allowedOnlyCUPinCash'
        | 'customCommissions'
        | 'commissions'
      >
    > = await this.getAll({
      query,
      projection: {
        name: 1,
        routeName: 1,
        addresses: 1,
        businessType: 1,
        currency: 1,
        deliveryConfig: 1,
        shoppingMeta: 1,
        allowedOnlyCUPinCash: 1,
        customCommissions: 1,
        commissions: 1
      }
    });

    return {
      getOneBusinessData: ({ routeName }) => {
        const oneBusinessData = businessData.find((business) => business.routeName === routeName);

        return {
          businessName: oneBusinessData?.name,
          businessAllowedOnlyCUPinCash: oneBusinessData?.allowedOnlyCUPinCash,
          businessAddress: oneBusinessData?.addresses?.[0],
          businessType: oneBusinessData?.businessType,
          businessCurrency: oneBusinessData?.currency,
          businessDeliveryConfig: oneBusinessData?.deliveryConfig,
          businessTermsAndConditions: oneBusinessData?.shoppingMeta?.termsAndConditions
        };
      }
    };
  };
}
