import { ModelDocument, QueryHandle } from '../../types/general';
import { modelGetter } from './schemas';
import { GetAllShoppingArgs, Shopping, ShoppingState } from './types';
import { isEqualIds, isNullOrUndefined } from '../../utils/general';
import { getAllFilterQuery } from './utils';
import { Post } from '../post/types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { User } from '../user/types';
import { getShoppingInfo } from './getShoppingInfo';
import { BusinessType, DeliveryConfig, DeliveryConfigType } from '../business/types';
import { Schema } from 'mongoose';

export type NArgsShopping = Pick<
  Shopping,
  | 'state'
  | 'purchaserId'
  | 'browserFingerprint'
  | 'routeName'
  | 'businessType'
  | 'requestedDelivery'
  | 'posts'
  | 'exchangeRates'
>;

export class ShoppingServices extends ModelCrudTemplate<
  Shopping,
  NArgsShopping,
  GetAllShoppingArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }

  getShoppingDataFromPosts: QueryHandle<
    {
      posts: Array<Post>;
    },
    {
      getOnePostShoppingData: (post: Post) => {
        amountInProcess: number;
        stockAmountAvailable: number;
        stockAmount: number;
      };
    }
  > = async ({ posts }) => {
    /**
     * shopping que tienen estos productos incluidos pero todavia no han sido vendidos. O sea, existen en los almacenes del comerciante
     * El stockAmount de los posts sera decrementado una vez se haya vendido y entregado el producto (cambia para ShoppingState.DELIVERED)*/
    const allShoppings = await this.getAll({
      query: {
        'posts.postData._id': { $in: posts.map((post) => post._id) },
        state: {
          $in: [
            ShoppingState.CONSTRUCTION,
            ShoppingState.REQUESTED,
            ShoppingState.APPROVED,
            ShoppingState.READY_TO_DELIVERY
          ]
        }
      }
    });

    return {
      getOnePostShoppingData: (post: Post) => {
        const { stockAmount } = post;
        const amountInProcess = allShoppings.reduce((acc, shopping) => {
          let out = acc;
          shopping.posts.forEach(({ count, postData }) => {
            if (isEqualIds(postData._id, post._id)) {
              out = out + count;
            }
          });

          return out;
        }, 0);

        return {
          amountInProcess,
          stockAmount,
          stockAmountAvailable: stockAmount - amountInProcess
        };
      }
    };
  };

  /**
   * Return tru if the shopping is or was approved
   */
  wasApprovedShopping = (shopping: Shopping): boolean => {
    const { state, history } = shopping;

    return (
      state === ShoppingState.APPROVED ||
      !!history?.find(({ state }) => state === ShoppingState.APPROVED)
    );
  };

  changeShoppingState = (
    shopping: ModelDocument<Shopping>,
    state: ShoppingState,
    reason?: string
  ): ModelDocument<Shopping> => {
    if (!shopping.history) {
      shopping.history = [];
    }

    shopping.history.push({
      state,
      lastUpdatedDate: new Date(),
      reason
    });

    shopping.state = state;

    return shopping;
  };

  changeShoppingAddCancellation = (
    shopping: ModelDocument<Shopping>,
    user: User
  ): ModelDocument<Shopping> => {
    shopping.cancellation = {
      requestedAt: new Date(),
      requestedBy: user._id
    };

    return shopping;
  };

  getDeliveryPrice = (args: {
    distance: number;
    deliveryConfig: DeliveryConfig;
  }): number | undefined => {
    const { deliveryConfig, distance } = args;

    const { minPrice = 0, priceByKm = 0 } = deliveryConfig;

    if (isNullOrUndefined(distance)) return undefined;

    const { type } = deliveryConfig || {};

    switch (type) {
      case DeliveryConfigType.OPTIONAL:
      case DeliveryConfigType.REQUIRED: {
        return minPrice + priceByKm * distance;
      }
      default: {
        return 0;
      }
    }
  };

  getDeliveryConfigToUse = (args: {
    businessType: BusinessType | undefined;
    businessDeliveryConfig: DeliveryConfig | undefined;
    adminDeliveryConfig: DeliveryConfig | undefined;
  }) => {
    const { businessType, adminDeliveryConfig, businessDeliveryConfig } = args;

    if (businessType === BusinessType.BUSINESS_FULL) {
      return businessDeliveryConfig;
    }

    return adminDeliveryConfig;
  };

  getShoppingInfo: typeof getShoppingInfo = (shopping) => getShoppingInfo(shopping);

  getShoppingSummary: QueryHandle<
    {
      query: GetAllShoppingArgs;
    },
    {
      getOneShoppingSummary: (args: { shoppingId: Schema.Types.ObjectId | string }) =>
        | {
            code: string;
            state: ShoppingState;
          }
        | undefined;
    }
  > = async ({ query }) => {
    const allShoppings: Array<Pick<Shopping, '_id' | 'code' | 'state'>> = await this.getAll({
      query,
      projection: {
        code: 1,
        state: 1,
        _id: 1
      }
    });

    return {
      getOneShoppingSummary: ({ shoppingId }) => {
        const shopping = allShoppings.find((s) => isEqualIds(s._id, shoppingId));

        if (!shopping) {
          return undefined;
        }

        return {
          code: shopping?.code,
          state: shopping?.state
        };
      }
    };
  };
}
