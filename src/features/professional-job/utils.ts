import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';
import { GetAllProfessionalJobArgs } from './types';

export const getAllFilterQuery = getFilterQueryFactory<GetAllProfessionalJobArgs>(
  ({ routeNames, search, ...filterQuery }) => {
    if (search) {
      filterQuery.name = getSearchRegexQuery(search);
    }

    ///////////////////////////////////////////////////////////////////

    if (routeNames?.length) {
      filterQuery.routeName = { $in: routeNames };
    }

    return filterQuery;
  }
);

export const getProfessionalJobSlugFromName = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD') // Elimina tildes y diacríticos
    .replace(/[\u0300-\u036f]/g, '') // Regex para remover los acentos
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .trim() // Elimina espacios al inicio y final
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .replace(/-+/g, '-');
};
