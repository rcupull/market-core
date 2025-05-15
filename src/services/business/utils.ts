import { Business } from './types';
import { FilterQuery, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';

export interface GetAllBusinessArgs extends FilterQuery<Business> {
  routeNames?: Array<string>;
  search?: string;
  hidden?: boolean;
}

export type UpdateQueryBusiness =
  | UpdateQuery<
      Partial<
        Pick<
          Business,
          | 'hidden'
          | 'socialLinks'
          | 'bannerImages'
          | 'name'
          | 'routeName'
          | 'logo'
          | 'layouts'
          | 'postCategories'
          | 'aboutUsPage'
          | 'aboutUsPage'
        >
      >
    >
  | UpdateWithAggregationPipeline;

export const getAllFilterQuery = getFilterQueryFactory<GetAllBusinessArgs>(
  ({ routeNames, search, hidden, ...filterQuery }) => {
    ///////////////////////////////////////////////////////////////////

    if (routeNames?.length) {
      filterQuery.routeName = { $in: routeNames };
    }
    ///////////////////////////////////////////////////////////////////

    if (search) {
      filterQuery.$or = [
        { name: getSearchRegexQuery(search) },
        { postCategories: { $elemMatch: { label: getSearchRegexQuery(search) } } }
      ];
    }
    ///////////////////////////////////////////////////////////////////

    if (hidden !== undefined) {
      filterQuery.hidden = hidden;
    }

    return filterQuery;
  }
);
