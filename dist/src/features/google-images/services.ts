import { GOOGLE_IMG_SCRAP, GOOGLE_QUERY } from 'google-img-scrap';
import { QueryHandle } from '../../types/general';
import ImageResultItem from 'google-img-scrap/dist/types/imageResultItem';
import { Logger } from 'winston';

/**
 * https://www.npmjs.com/package/google-img-scrap
 * https://stackoverflow.com/questions/54254235/axios-request-failed-with-status-code-429-but-it-is-working-with-postman
 * https://www.npmjs.com/package/retry-axios
 */

export class GoogleImagesServices {
  constructor(
    private readonly options: {
      logger: Logger;
    }
  ) {}

  scrapImages: QueryHandle<
    { search: string },
    {
      result: Array<ImageResultItem>;
      search: string;
    }
  > = async ({ search }) => {
    try {
      const response = await GOOGLE_IMG_SCRAP({
        search,
        safeSearch: true,
        query: {
          SIZE: GOOGLE_QUERY.SIZE.MEDIUM,
          LICENCE: GOOGLE_QUERY.LICENCE.COMMERCIAL_AND_OTHER
        }
      });

      return {
        result: response.result,
        search: response.search
      };
    } catch (e) {
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
