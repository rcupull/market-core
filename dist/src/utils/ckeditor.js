"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllImageSrcFromRichText = void 0;
const general_1 = require("./general");
const getAllImageSrcFromRichText = (allTexts) => {
    let out = (0, general_1.compact)(allTexts).flatMap((text) => {
        const matches = [...text.matchAll(/src="([^"]+)"/g)];
        return matches.map((match) => match[1]);
    });
    out = out.flatMap((text) => {
        const matches = [...text.matchAll(/(images.*)$/g)];
        return matches.map((match) => match[1]);
    });
    return out;
};
exports.getAllImageSrcFromRichText = getAllImageSrcFromRichText;
