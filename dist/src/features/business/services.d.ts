import { Business } from './types';
import { GetAllBusinessArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class BusinessServices extends ModelCrudTemplate<Business, Pick<Business, 'createdBy' | 'routeName' | 'name'>, GetAllBusinessArgs> {
    constructor();
}
