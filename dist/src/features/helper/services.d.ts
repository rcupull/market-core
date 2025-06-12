import { Helper } from './types';
import { GetAllHelpersArgs, getHelperSlugFromTitle } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { FileServices } from '../files/services';
export declare class HelperServices extends ModelCrudTemplate<Helper, Pick<Helper, 'title' | 'content' | 'hidden' | 'relatedIds' | 'helperSlug'>, GetAllHelpersArgs> {
    private readonly fileServices;
    constructor(fileServices: FileServices);
    getHelperSlugFromTitle: typeof getHelperSlugFromTitle;
    removeUnusedImages: () => Promise<void>;
}
