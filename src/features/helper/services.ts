import { modelGetter } from './schemas';
import { Helper } from './types';

import { GetAllHelpersArgs, getAllFilterQuery, getHelperSlugFromTitle } from './utils';
import { compact } from '../../utils/general';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { FileServices } from '../files/services';
import { getAllImageSrcFromRichText } from '../../utils/ckeditor';

export class HelperServices extends ModelCrudTemplate<
  Helper,
  Pick<Helper, 'title' | 'content' | 'hidden' | 'relatedIds' | 'helperSlug'>,
  GetAllHelpersArgs
> {
  constructor(private readonly fileServices: FileServices) {
    super(modelGetter, getAllFilterQuery);
  }

  getHelperSlugFromTitle: typeof getHelperSlugFromTitle = (title) => getHelperSlugFromTitle(title);

  removeUnusedImages = async () => {
    const helpers = await this.getAll({ query: {} });

    const helperImagesSrcInText = getAllImageSrcFromRichText(helpers.map((faq) => faq.content));
    const helperImagesSrcInBucket = await this.fileServices.getAllObjectBucket('images/helpers/');

    this.fileServices.imagesDeleteMany({
      newImages: compact(helperImagesSrcInText).map((src) => ({
        src,
        height: 0,
        width: 0
      })),
      oldImages: compact(helperImagesSrcInBucket).map((src) => ({
        src,
        height: 0,
        width: 0
      }))
    });
  };
}
