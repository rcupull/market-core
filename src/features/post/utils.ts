import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';
import { GetAllPostArgs } from './types';

export const getAllFilterQuery = getFilterQueryFactory<GetAllPostArgs>(
  ({
    routeNames,
    postsIds,
    search,
    postCategoriesLabels,
    postCategoriesMethod,
    ...filterQuery
  }) => {
    if (search) {
      filterQuery.name = getSearchRegexQuery(search);
    }

    if (postCategoriesLabels) {
      switch (postCategoriesMethod) {
        case 'every': {
          filterQuery.postCategoriesLabels = { $all: postCategoriesLabels };
          break;
        }
        case 'some': {
          filterQuery.postCategoriesLabels = { $in: postCategoriesLabels };
          break;
        }
        default: {
          filterQuery.postCategoriesLabels = { $all: postCategoriesLabels };
          break;
        }
      }
    }

    ///////////////////////////////////////////////////////////////////

    if (routeNames?.length) {
      filterQuery.routeName = { $in: routeNames };
    }

    if (postsIds?.length) {
      filterQuery._id = { $in: postsIds };
    }

    return filterQuery;
  }
);

export const getPostSlugFromName = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD') // Elimina tildes y diacríticos
    .replace(/[\u0300-\u036f]/g, '') // Regex para remover los acentos
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .trim() // Elimina espacios al inicio y final
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .replace(/-+/g, '-');
};
