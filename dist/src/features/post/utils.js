"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostSlug = exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ routeNames, postsIds, search, postCategoriesLabels, postCategoriesMethod, ...filterQuery }) => {
    if (search) {
        filterQuery.name = (0, schemas_1.getSearchRegexQuery)(search);
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
    if (routeNames === null || routeNames === void 0 ? void 0 : routeNames.length) {
        filterQuery.routeName = { $in: routeNames };
    }
    if (postsIds === null || postsIds === void 0 ? void 0 : postsIds.length) {
        filterQuery._id = { $in: postsIds };
    }
    return filterQuery;
});
const getPostSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD') // Elimina tildes y diacríticos
        .replace(/[\u0300-\u036f]/g, '') // Regex para remover los acentos
        .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
        .trim() // Elimina espacios al inicio y final
        .replace(/\s+/g, '-') // Reemplaza espacios por guiones
        .replace(/-+/g, '-');
};
exports.getPostSlug = getPostSlug;
