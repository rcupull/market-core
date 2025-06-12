import { FilterQuery } from 'mongoose';
import { Helper } from './types';
import { getBooleanQuery, getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';
import { isBoolean } from '../../utils/general';

export interface GetAllHelpersArgs extends FilterQuery<Helper> {
  search?: string;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllHelpersArgs>(
  ({ search, hidden, ...filterQuery }) => {
    /**
     * ////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////
     */

    if (search) {
      filterQuery.$or.push({ title: getSearchRegexQuery(search) });
    }

    if (isBoolean(hidden)) {
      filterQuery.hidden = getBooleanQuery(hidden);
    }

    return filterQuery;
  }
);

export const getHelperSlugFromTitle = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD') // Elimina tildes y diacríticos
    .replace(/[\u0300-\u036f]/g, '') // Regex para remover los acentos
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .trim() // Elimina espacios al inicio y final
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .replace(/-+/g, '-');
};
