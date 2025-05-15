import { CategoryModel } from './schemas';
import { Category } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { GetAllCategoriesArgs, getAllFilterQuery } from './utils';

export class CategoriesServices extends ModelCrudTemplate<
  Category,
  Pick<Category, 'label' | 'categoryImage'>,
  GetAllCategoriesArgs
> {
  constructor() {
    super(CategoryModel, getAllFilterQuery);
  }
}
