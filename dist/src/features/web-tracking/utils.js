"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeTracks = void 0;
const date_fns_1 = require("date-fns");
const general_1 = require("../../utils/general");
const mergeTracks = (data) => {
    const mergedData = {};
    Object.entries(data).forEach(([key, value]) => {
        value.forEach(({ count, date }) => {
            (0, general_1.set)(mergedData, `${date}.${key}`, count);
        });
    });
    const items = Object.entries(mergedData).map(([date, value]) => ({
        date,
        ...value
    }));
    items.sort((a, b) => {
        return (0, date_fns_1.compareDesc)((0, date_fns_1.parseISO)(a.date), (0, date_fns_1.parseISO)(b.date));
    });
    return items;
};
exports.mergeTracks = mergeTracks;
