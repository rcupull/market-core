import { HelperServices } from '../helper/services';
import { Helper } from '../helper/types';
import { HelperDto } from './types';
export declare class HelperDtosServices {
    private readonly helperServices;
    constructor(helperServices: HelperServices);
    getHelperDto: (helpers: Array<Helper>) => Promise<Array<HelperDto>>;
}
