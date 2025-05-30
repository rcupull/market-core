import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { modelGetter } from './schemas';
import { Category } from './types';
import { GetAllCategoriesArgs, getAllFilterQuery, getCategorySlugFromLabel } from './utils';

export class CategoriesServices extends ModelCrudTemplate<
  Category,
  Pick<Category, 'label' | 'categoryImages' | 'categorySlug'>,
  GetAllCategoriesArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }

  getCategorySlugFromLabel: typeof getCategorySlugFromLabel = (name) => {
    return getCategorySlugFromLabel(name);
  };
}
