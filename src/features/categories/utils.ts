import { FilterQuery } from 'mongoose';
import { Category } from './types';
import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';

export interface GetAllCategoriesArgs extends FilterQuery<Category> {
  search?: string;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllCategoriesArgs>(
  ({ search, ...filterQuery }) => {
    if (search) {
      filterQuery.label = getSearchRegexQuery(search);
    }

    return filterQuery;
  }
);

export const getCategorySlugFromLabel = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD') // Elimina tildes y diacríticos
    .replace(/[\u0300-\u036f]/g, '') // Regex para remover los acentos
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .trim() // Elimina espacios al inicio y final
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .replace(/-+/g, '-');
};
