import { compact, deepJsonCopy, isEqualIds } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';
import { HelperServices } from '../helper/services';
import { Helper } from '../helper/types';
import { HelperDto } from './types';

export class HelperDtosServices {
  constructor(private readonly helperServices: HelperServices) {}

  getHelperDto = async (helpers: Array<Helper>): Promise<Array<HelperDto>> => {
    const allRelated = await this.helperServices.getAll({
      query: {
        _id: getInArrayQuery(helpers.map((helper) => helper.relatedIds || []).flat())
      }
    });

    const getDto = (helper: Helper): HelperDto => {
      return {
        ...deepJsonCopy(helper),
        relatedHelpers: compact(
          (helper.relatedIds || []).map((relatedId) => {
            const relatedHelper = allRelated.find((faq) => isEqualIds(faq.id, relatedId));

            if (!relatedHelper) {
              return undefined;
            }

            if (relatedHelper.hidden) {
              return undefined;
            }

            return {
              helperSlug: relatedHelper.helperSlug,
              title: relatedHelper.title
            };
          })
        )
      };
    };

    return helpers.map(getDto);
  };
}
