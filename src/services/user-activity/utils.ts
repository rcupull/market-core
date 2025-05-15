import { ScoreElement } from './types';

export const normalizeScores = (scores: Array<ScoreElement>): Array<ScoreElement> => {
  const maxScore = Math.max(1, ...scores.map(({ score }) => score));

  return scores.map(({ productId, score }) => ({
    productId,
    score: score / maxScore // normalize
  }));
};
