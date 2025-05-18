import { TrackCounter, WebTracking, WebTrackingType } from './types';
import { FilterQuery } from 'mongoose';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class WebTrackingServices extends ModelCrudTemplate<WebTracking, Pick<WebTracking, 'browserFingerprint' | 'hostname' | 'type' | 'userId' | 'data'>, FilterQuery<WebTracking>> {
    constructor();
    mergeTracks: <T extends Record<string, Array<TrackCounter>>>(data: T) => ({
        date: string;
    } & Record<keyof T, number>)[];
    getNewVisitorsByDay: () => Promise<TrackCounter[]>;
    getTotalVisitorsByDay: () => Promise<TrackCounter[]>;
    getVisitorsWithoutInteractions: () => Promise<TrackCounter[]>;
    getEventsAmount: (types: Array<WebTrackingType>) => Promise<TrackCounter[]>;
}
