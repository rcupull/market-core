import { Schema } from 'mongoose';
import { Address, Currency, QueryHandle } from '../../types/general';
import { Business, BusinessType, DeliveryConfig } from './types';
import { BusinessModel } from './schemas';

import { GetAllBusinessArgs, getAllFilterQuery } from './utils';
import { Shopping } from '../shopping/types';
import { Post } from '../post/types';
import { includesId } from '../../utils/general';
import { User } from '../user/types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Bill } from '../bill/types';

export class BusinessServices extends ModelCrudTemplate<
  Business,
  Pick<Business, 'createdBy' | 'routeName' | 'name'>,
  GetAllBusinessArgs
> {
  constructor() {
    super(BusinessModel, getAllFilterQuery);
  }

  //@ts-expect-error ignore return type
  getBusinessDataFrom: QueryHandle<
    {
      query: GetAllBusinessArgs;
    },
    {
      getOneShoppingBusinessData: (shopping: Shopping) => {
        businessName: string;
        businessAddress: Address | undefined;
        businessType: BusinessType;
        businessDeliveryConfig: DeliveryConfig | undefined;
        businessAllowedOnlyCUPinCash: boolean | undefined;
        businessCurrency: Currency;
        businessTermsAndConditions: string | undefined;
      };
      getOnePostBusinessData: (post: Post) => {
        businessName: string;
        businessAddress: Address | undefined;
        businessType: BusinessType;
        businessDeliveryConfig: DeliveryConfig | undefined;
        businessCurrency: Currency;
        businessAllowedOnlyCUPinCash: boolean | undefined;
        businessTermsAndConditions: string | undefined;
        commissionsDefault: boolean;
      };
      getOneBillBusinessData: (bill: Bill) => {
        businessName: string;
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
        | 'customCommissions'
        | 'commissions'
        | 'allowedOnlyCUPinCash'
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
        allowedOnlyCUPinCash: 1
      }
    });

    return {
      getOneShoppingBusinessData: (shopping) => {
        const oneBusinessData = businessData.find(
          (business) => business.routeName === shopping.routeName
        );

        return {
          businessName: oneBusinessData?.name,
          businessAllowedOnlyCUPinCash: oneBusinessData?.allowedOnlyCUPinCash,
          businessAddress: oneBusinessData?.addresses?.[0],
          businessType: oneBusinessData?.businessType,
          businessCurrency: oneBusinessData?.currency,
          businessDeliveryConfig: oneBusinessData?.deliveryConfig,
          businessTermsAndConditions: oneBusinessData?.shoppingMeta?.termsAndConditions
        };
      },
      getOnePostBusinessData: (post) => {
        const oneBusinessData = businessData.find(
          (business) => business.routeName === post.routeName
        );
        return {
          businessName: oneBusinessData?.name,
          businessAllowedOnlyCUPinCash: oneBusinessData?.allowedOnlyCUPinCash,
          businessAddress: oneBusinessData?.addresses?.[0],
          businessType: oneBusinessData?.businessType,
          businessCurrency: oneBusinessData?.currency,
          businessDeliveryConfig: oneBusinessData?.deliveryConfig,
          businessTermsAndConditions: oneBusinessData?.shoppingMeta?.termsAndConditions,
          customCommissions: oneBusinessData?.customCommissions
        };
      },
      getOneBillBusinessData: (bill) => {
        const oneBusinessData = businessData.find(
          (business) => business.routeName === bill.routeName
        );
        return {
          businessName: oneBusinessData?.name
        };
      }
    };
  };

  getBusinessFavoritesData: QueryHandle<
    {
      query: GetAllBusinessArgs;
    },
    {
      getFavoritesBusiness: (userId: Schema.Types.ObjectId) => Array<{
        name: string;
        routeName: string;
      }>;
    }
  > = async ({ query }) => {
    const businessData: Array<Pick<Business, 'routeName' | 'name' | 'favoritesUserIds'>> =
      await this.getAll({
        query,
        projection: {
          name: 1,
          routeName: 1,
          favoritesUserIds: 1
        }
      });

    return {
      getFavoritesBusiness: (userId) => {
        return businessData.reduce<
          Array<{
            name: string;
            routeName: string;
          }>
        >((acc, { favoritesUserIds = [], name, routeName }) => {
          const isFavorite = includesId(favoritesUserIds, userId);

          if (isFavorite) {
            return [
              ...acc,
              {
                name,
                routeName
              }
            ];
          }

          return acc;
        }, []);
      }
    };
  };

  getAccesiblesRouteNames = async (args: { user: User; routeNames?: Array<string> }) => {
    const { user, routeNames } = args;

    const accesiblesRouteNames = user.isOwnerOf.reduce<Array<string>>((acc, routeName) => {
      return routeNames?.includes(routeName) ? [...acc, routeName] : acc;
    }, []);

    return {
      accesiblesRouteNames
    };
  };
}
