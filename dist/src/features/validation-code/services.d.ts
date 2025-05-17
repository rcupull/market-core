import { FilterQuery } from 'mongoose';
import { ValidationCode } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class ValidationCodeServices extends ModelCrudTemplate<ValidationCode, Pick<ValidationCode, 'userId'>, FilterQuery<ValidationCode>> {
    constructor();
}
