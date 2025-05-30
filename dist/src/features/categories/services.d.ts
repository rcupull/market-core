import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Category } from './types';
import { GetAllCategoriesArgs, getCategorySlugFromLabel } from './utils';
export declare class CategoriesServices extends ModelCrudTemplate<Category, Pick<Category, 'label' | 'categoryImages' | 'categorySlug'>, GetAllCategoriesArgs> {
    constructor();
    getCategorySlugFromLabel: typeof getCategorySlugFromLabel;
}
