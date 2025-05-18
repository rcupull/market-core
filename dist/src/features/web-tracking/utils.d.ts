import { TrackCounter } from './types';
export declare const mergeTracks: <T extends Record<string, Array<TrackCounter>>>(data: T) => ({
    date: string;
} & Record<keyof T, number>)[];
