import { FilterQuery } from 'mongoose';
import { Faq } from './types';
import {
  getBooleanQuery,
  getFilterQueryFactory,
  getInArrayQuery,
  getSearchRegexQuery
} from '../../utils/schemas';
import { isBoolean } from '../../utils/general';

export interface GetAllFaqsArgs extends FilterQuery<Faq> {
  search?: string;
  questionSuggestions?: Array<string>;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllFaqsArgs>(
  ({ search, questionSuggestions, hidden, ...filterQuery }) => {
    /**
     * ////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////
     */

    if (search) {
      filterQuery.$or.push({ question: getSearchRegexQuery(search) });
    }

    if (questionSuggestions?.length) {
      filterQuery.$or.push({ question: getInArrayQuery(questionSuggestions) });
    }

    if (isBoolean(hidden)) {
      filterQuery.hidden = getBooleanQuery(hidden);
    }

    return filterQuery;
  }
);
