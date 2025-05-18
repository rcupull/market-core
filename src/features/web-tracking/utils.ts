import { compareDesc, parseISO } from 'date-fns';
import { set } from '../../utils/general';
import { TrackCounter } from './types';

export const mergeTracks = <T extends Record<string, Array<TrackCounter>>>(data: T) => {
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
