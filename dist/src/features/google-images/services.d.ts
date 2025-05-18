import { QueryHandle } from '../../types/general';
import ImageResultItem from 'google-img-scrap/dist/types/imageResultItem';
import { Logger } from 'winston';
/**
 * https://www.npmjs.com/package/google-img-scrap
 * https://stackoverflow.com/questions/54254235/axios-request-failed-with-status-code-429-but-it-is-working-with-postman
 * https://www.npmjs.com/package/retry-axios
 */
export declare class GoogleImagesServices {
    private readonly options;
    constructor(options: {
        logger: Logger;
    });
    scrapImages: QueryHandle<{
        search: string;
    }, {
        result: Array<ImageResultItem>;
        search: string;
    }>;
}
