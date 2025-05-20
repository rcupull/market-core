import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Category } from './types';
import { GetAllCategoriesArgs } from './utils';
export declare class CategoriesServices extends ModelCrudTemplate<Category, Pick<Category, 'label' | 'categoryImages'>, GetAllCategoriesArgs> {
    constructor();
}
