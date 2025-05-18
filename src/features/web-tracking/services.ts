import { TrackCounter, WebTracking, WebTrackingType } from './types';
import { modelGetter } from './schemas';

import { FilterQuery } from 'mongoose';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { getCreatedLastMonthQuery } from '../../utils/schemas';
import { set } from '../../utils/general';
import { compareDesc, parseISO } from 'date-fns';

const groupDateFormat = '%Y-%m-%d';

export class WebTrackingServices extends ModelCrudTemplate<
  WebTracking,
  Pick<WebTracking, 'browserFingerprint' | 'hostname' | 'type' | 'userId' | 'data'>,
  FilterQuery<WebTracking>
> {
  constructor() {
    super(modelGetter);
  }

  mergeTracks = <T extends Record<string, Array<TrackCounter>>>(data: T) => {
    const mergedData: Record<string, Record<keyof T, number>> = {};

    Object.entries(data).forEach(([key, value]) => {
      value.forEach(({ count, date }) => {
        set(mergedData, `${date}.${key}`, count);
      });
    });

    const items = Object.entries(mergedData).map(([date, value]) => ({
      date,
      ...value
    }));

    items.sort((a, b) => {
      return compareDesc(parseISO(a.date), parseISO(b.date));
    });

    return items;
  };

  getNewVisitorsByDay = async () => {
    const out = await this.aggregate<TrackCounter>({
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
            ...getCreatedLastMonthQuery()
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

  getTotalVisitorsByDay = async () => {
    const out = await this.aggregateOnMatch<TrackCounter>({
      matchQuery: {
        ...getCreatedLastMonthQuery()
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

  getVisitorsWithoutInteractions = async () => {
    const out = await this.aggregateOnMatch<TrackCounter>({
      matchQuery: {
        ...getCreatedLastMonthQuery()
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

  getEventsAmount = async (types: Array<WebTrackingType>) => {
    const out = await this.aggregateOnMatch<TrackCounter>({
      matchQuery: {
        type: { $in: types },
        ...getCreatedLastMonthQuery()
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
