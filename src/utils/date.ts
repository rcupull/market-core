import {
  add,
  addDays,
  addMonths,
  addWeeks,
  isWithinInterval,
  min,
  startOfDay,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { RangeUnit } from '../types/date';

export const getFirstStartPoint = (args: { rangeUnit: RangeUnit }) => {
  const { rangeUnit } = args;

  if (rangeUnit === 'day') {
    return startOfDay(new Date());
  }

  if (rangeUnit === 'week') {
    return startOfWeek(new Date(), {
      weekStartsOn: 1
    });
  }

  return startOfMonth(new Date());
};

export const getCustomStartPoint = (args: {
  startPoint: Date;
  rangeIncrement: number;
  rangeUnit: RangeUnit;
}) => {
  const { rangeIncrement, rangeUnit, startPoint } = args;

  if (rangeUnit === 'day') {
    return addDays(startPoint, rangeIncrement);
  }

  if (rangeUnit === 'week') {
    return addWeeks(startPoint, rangeIncrement);
  }

  return addMonths(startPoint, rangeIncrement);
};

export const getLastLastPoint = (args: { startPoint: Date; rangeUnit: RangeUnit }) => {
  const { rangeUnit, startPoint } = args;

  const getHandle = () => {
    if (rangeUnit === 'day') {
      return add(startPoint, {
        days: 1,
        seconds: -1
      });
    }

    if (rangeUnit === 'week') {
      return add(startPoint, {
        weeks: 1,
        seconds: -1
      });
    }

    return add(startPoint, {
      months: 1,
      seconds: -1
    });
  };

  const lastPoint = getHandle();

  return min([lastPoint, new Date()]);
};

export const getStartPoint = (args: { index: number; rangeUnit: RangeUnit }): Date => {
  const { index, rangeUnit } = args;
  const firstStartPoint = getFirstStartPoint({ rangeUnit });

  const customStartPoint = getCustomStartPoint({
    startPoint: firstStartPoint,
    rangeUnit,
    rangeIncrement: -index
  });
  return customStartPoint;
};

export const getIsWithInterval = (args: {
  date: Date;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}) => {
  const { date, dateFrom, dateTo } = args;

  if (!dateFrom || !dateTo) return false;

  return isWithinInterval(date, {
    start: dateFrom,
    end: dateTo
  });
};
