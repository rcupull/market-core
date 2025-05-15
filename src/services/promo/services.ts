import { Promo, PromoDto, PromoEntityType } from './types';

import { getAllFilterQuery, GetAllPromoArgs } from './utils';

import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { PromoModel } from './schemas';
import { deepJsonCopy } from '../../utils/general';
import { PostServices } from '../post/services';

export class PromoServices extends ModelCrudTemplate<
  Promo,
  Pick<Promo, 'entityId' | 'entityType' | 'image' | 'name' | 'description'>,
  GetAllPromoArgs
> {
  constructor(private readonly postServices: PostServices) {
    super(PromoModel, getAllFilterQuery);
  }

  getDtos = async (promos: Array<Promo>): Promise<Array<PromoDto>> => {
    const handle = async (promo: Promo): Promise<PromoDto> => {
      return {
        ...deepJsonCopy(promo),
        postSlug: undefined,
        routeName: undefined,
        ...(await (async () => {
          const { entityId, entityType } = promo;
          if (entityType === PromoEntityType.PRODUCT) {
            const post = await this.postServices.getOne({
              query: {
                _id: entityId
              },
              projection: {
                routeName: 1,
                postSlug: 1
              }
            });

            if (post) {
              return {
                postSlug: post.postSlug,
                routeName: post.routeName
              };
            }
          }

          return {};
        })())
      };
    };

    const out = await Promise.all(promos.map(handle));

    return out;
  };
}
