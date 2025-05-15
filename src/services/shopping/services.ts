import { QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
import { ShoppingModel } from './schemas';
import { Shopping, ShoppingPostData, ShoppingState } from './types';
import { Post } from '../post/types';
import { isEqualIds, isNumber } from '../../utils/general';
import { getAllFilterQuery, GetAllShoppingArgs } from './utils';
import { PostServices } from '../post/services';
import { logger } from '../logger';
import { ConfigServices } from '../config/services';
import { NotificationsServices } from '../notifications/services';

import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { NotificationsDataServices } from '../notifications-data/services';
import { getShoppingInfo } from './getShoppingInfo';

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
  constructor(
    private readonly configServices: ConfigServices,
    private readonly postServices: PostServices,
    private readonly notificationsServices: NotificationsServices,
    private readonly notificationsDataServices: NotificationsDataServices
  ) {
    super(ShoppingModel, getAllFilterQuery);
  }

  count: QueryHandle<
    {
      query: GetAllShoppingArgs;
    },
    number
  > = async ({ query }) => {
    const filterQuery = getAllFilterQuery(query);

    const out = await ShoppingModel.countDocuments(filterQuery);

    return out;
  };

  getDataFromPosts: QueryHandle<
    {
      posts: Array<Post>;
    },
    {
      getPostData: (post: Post) => {
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
      getPostData: (post: Post) => {
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

  getShoppingDataFrom: QueryHandle<
    {
      query: GetAllShoppingArgs;
    },
    {
      getShoppingData: (shoppingId: Schema.Types.ObjectId | string) =>
        | {
            code: string;
            state: ShoppingState;
          }
        | undefined;
    }
  > = async ({ query }) => {
    /**
     * shopping que tienen estos productos incluidos pero todavia no han sido vendidos. O sea, existen en los almacenes del comerciante
     * El stockAmount de los posts sera decrementado una vez se haya vendido y entregado el producto (cambia para ShoppingState.DELIVERED)*/
    const allShoppings: Array<Pick<Shopping, '_id' | 'code' | 'state'>> = await this.getAll({
      query,
      projection: {
        code: 1,
        state: 1,
        _id: 1
      }
    });

    return {
      getShoppingData: (shoppingId) => {
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

  sendUpdateStockAmountMessagesFromShoppingPosts: QueryHandle<{
    shopping: Shopping;
  }> = async ({ shopping }) => {
    if (
      ![ShoppingState.REJECTED, ShoppingState.CANCELED, ShoppingState.CONSTRUCTION].includes(
        shopping.state
      )
    ) {
      logger.info('No need to send update stock amount messages from shopping posts.');
      return;
    }

    const posts = await this.postServices.getAll({
      query: {
        postsIds: shopping.posts.map((post) => post.postData._id.toString())
      }
    });

    const { getPostData } = await this.getDataFromPosts({
      posts
    });

    /**
     * Send notifications to update the stock in the front
     */

    const handleUpdatePostStock = async (post: Post) => {
      const { stockAmountAvailable } = getPostData(post);

      if (isNumber(stockAmountAvailable)) {
        /**
         * send notification to update the post
         */
        const usersData = await this.notificationsDataServices.getUsersData({
          query: {}
        });
        this.notificationsServices.UpdateStockAmountMessage({
          usersData,
          postId: post._id.toString(),
          stockAmountAvailable
        });
      }
    };

    await Promise.all(
      posts.map((post) => {
        return new Promise((resolve, reject) =>
          handleUpdatePostStock(post).then(resolve).catch(reject)
        );
      })
    );
  };

  getShoppingInfo: typeof getShoppingInfo = getShoppingInfo;

  getPostData: QueryHandle<
    {
      post: Post;
    },
    ShoppingPostData
  > = async ({ post }) => {
    const { getCommissionsForProduct } = await this.configServices.adminConfigExangesRatesUtils();

    const { getCopyAndFlattenPost } = await this.postServices.useGetCopyAndFlattenPost();

    const { _id, price, images, routeName, name, currency, currenciesOfSale } =
      getCopyAndFlattenPost(post, {
        transformCurrenciesOfSale: true,
        transformCurrencyAndPrice: true
      });

    const { commissions } = getCommissionsForProduct(post);

    return {
      _id,
      name,
      routeName,
      images,
      //
      salePrice: price || 0,
      currency,
      currenciesOfSale,
      //
      commissions
    };
  };
}
