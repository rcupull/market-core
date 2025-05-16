import { ApiTracking } from './types';
import { GetAllApiTrackingArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class ApiTrackingServices extends ModelCrudTemplate<ApiTracking, Pick<ApiTracking, 'body' | 'descriptionDevice' | 'params' | 'path' | 'query' | 'userId' | 'method'>, GetAllApiTrackingArgs> {
    constructor();
}
