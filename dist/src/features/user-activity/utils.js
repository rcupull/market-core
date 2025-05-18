"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeScores = void 0;
const normalizeScores = (scores) => {
    const maxScore = Math.max(1, ...scores.map(({ score }) => score));
    return scores.map(({ productId, score }) => ({
        productId,
        score: score / maxScore // normalize
    }));
};
exports.normalizeScores = normalizeScores;
