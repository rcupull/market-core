import { TrackCounter, WebTracking, WebTrackingType } from './types';
import { WebTrackingModel } from './schemas';

import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { FilterQuery } from 'mongoose';
import { getCreatedLastMonthQuery } from '../../utils/api';

const groupDateFormat = '%Y-%m-%d';

export class WebTrackingServices extends ModelCrudTemplate<
  WebTracking,
  Pick<WebTracking, 'browserFingerprint' | 'hostname' | 'type' | 'userId' | 'data'>,
  FilterQuery<WebTracking>
> {
  constructor() {
    super(WebTrackingModel);
  }

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
