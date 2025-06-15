import { Helper } from '../helper/types';

export interface HelperDto extends Helper {
  relatedHelpers: Array<Pick<Helper, 'helperSlug' | 'title'>> | undefined;
}
