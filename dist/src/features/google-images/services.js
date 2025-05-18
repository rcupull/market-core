"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleImagesServices = void 0;
const google_img_scrap_1 = require("google-img-scrap");
/**
 * https://www.npmjs.com/package/google-img-scrap
 * https://stackoverflow.com/questions/54254235/axios-request-failed-with-status-code-429-but-it-is-working-with-postman
 * https://www.npmjs.com/package/retry-axios
 */
class GoogleImagesServices {
    constructor(options) {
        this.options = options;
        this.scrapImages = async ({ search }) => {
            try {
                const response = await (0, google_img_scrap_1.GOOGLE_IMG_SCRAP)({
                    search,
                    safeSearch: true,
                    query: {
                        SIZE: google_img_scrap_1.GOOGLE_QUERY.SIZE.MEDIUM,
                        LICENCE: google_img_scrap_1.GOOGLE_QUERY.LICENCE.COMMERCIAL_AND_OTHER
                    }
                });
                return {
                    result: response.result,
                    search: response.search
                };
            }
            catch (e) {
                const { logger } = this.options;
                logger.error('Failed: Images scraping');
                logger.error(JSON.stringify(e));
                return {
                    result: [],
                    search
                };
            }
        };
    }
}
exports.GoogleImagesServices = GoogleImagesServices;
