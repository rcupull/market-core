"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelperSlugFromTitle = exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../utils/general");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ search, hidden, ...filterQuery }) => {
    /**
     * ////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////
     */
    if (search) {
        filterQuery.$or.push({ title: (0, schemas_1.getSearchRegexQuery)(search) });
    }
    if ((0, general_1.isBoolean)(hidden)) {
        filterQuery.hidden = (0, schemas_1.getBooleanQuery)(hidden);
    }
    return filterQuery;
});
const getHelperSlugFromTitle = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD') // Elimina tildes y diacríticos
        .replace(/[\u0300-\u036f]/g, '') // Regex para remover los acentos
        .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
        .trim() // Elimina espacios al inicio y final
        .replace(/\s+/g, '-') // Reemplaza espacios por guiones
        .replace(/-+/g, '-');
};
exports.getHelperSlugFromTitle = getHelperSlugFromTitle;
