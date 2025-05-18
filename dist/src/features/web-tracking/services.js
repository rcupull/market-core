"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebTrackingServices = void 0;
const schemas_1 = require("./schemas");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const schemas_2 = require("../../utils/schemas");
const general_1 = require("../../utils/general");
const date_fns_1 = require("date-fns");
const groupDateFormat = '%Y-%m-%d';
class WebTrackingServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter);
        this.mergeTracks = (data) => {
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
        this.getNewVisitorsByDay = async () => {
            const out = await this.aggregate({
                pipeline: [
                    {
                        $group: {
                            _id: '$browserFingerprint',
                            createdAt: {
                                $min: '$createdAt'
                            }
                        }
                    },
                    {
                        $match: {
                            ...(0, schemas_2.getCreatedLastMonthQuery)()
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: groupDateFormat, date: '$createdAt' }
                            },
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $addFields: {
                            date: '$_id'
                        }
                    },
                    {
                        $unset: '_id'
                    }
                ]
            });
            return out;
        };
        this.getTotalVisitorsByDay = async () => {
            const out = await this.aggregateOnMatch({
                matchQuery: {
                    ...(0, schemas_2.getCreatedLastMonthQuery)()
                },
                pipeline: [
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: groupDateFormat, date: '$createdAt' }
                            },
                            uniqueUsers: { $addToSet: '$browserFingerprint' }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            count: { $size: '$uniqueUsers' }
                        }
                    },
                    {
                        $addFields: {
                            date: '$_id'
                        }
                    },
                    {
                        $unset: '_id'
                    }
                ]
            });
            return out;
        };
        this.getVisitorsWithoutInteractions = async () => {
            const out = await this.aggregateOnMatch({
                matchQuery: {
                    ...(0, schemas_2.getCreatedLastMonthQuery)()
                },
                pipeline: [
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: { format: groupDateFormat, date: '$createdAt' }
                                },
                                browserFingerprint: '$browserFingerprint'
                            },
                            types: {
                                $push: '$type'
                            }
                        }
                    },
                    {
                        $match: {
                            types: {
                                $not: {
                                    $elemMatch: {
                                        $ne: 'page.view'
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id.date',
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $addFields: {
                            date: '$_id'
                        }
                    },
                    {
                        $unset: '_id'
                    }
                ]
            });
            return out;
        };
        this.getEventsAmount = async (types) => {
            const out = await this.aggregateOnMatch({
                matchQuery: {
                    type: { $in: types },
                    ...(0, schemas_2.getCreatedLastMonthQuery)()
                },
                pipeline: [
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: { format: groupDateFormat, date: '$createdAt' }
                                }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $addFields: {
                            date: '$_id.date'
                        }
                    },
                    {
                        $unset: '_id'
                    }
                ]
            });
            return out;
        };
    }
}
exports.WebTrackingServices = WebTrackingServices;
