"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfessionalJobSlugFromName = exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ routeNames, search, ...filterQuery }) => {
    if (search) {
        filterQuery.name = (0, schemas_1.getSearchRegexQuery)(search);
    }
    ///////////////////////////////////////////////////////////////////
    if (routeNames === null || routeNames === void 0 ? void 0 : routeNames.length) {
        filterQuery.routeName = { $in: routeNames };
    }
    return filterQuery;
});
const getProfessionalJobSlugFromName = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD') // Elimina tildes y diacríticos
        .replace(/[\u0300-\u036f]/g, '') // Regex para remover los acentos
        .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
        .trim() // Elimina espacios al inicio y final
        .replace(/\s+/g, '-') // Reemplaza espacios por guiones
        .replace(/-+/g, '-');
};
exports.getProfessionalJobSlugFromName = getProfessionalJobSlugFromName;
