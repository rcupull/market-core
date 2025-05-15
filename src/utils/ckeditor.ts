import { compact } from './general';

export const getAllImageSrcFromRichText = (allTexts: Array<string | undefined>) => {
  let out = compact(allTexts).flatMap((text) => {
    const matches = [...text.matchAll(/src="([^"]+)"/g)];
    return matches.map((match) => match[1]);
  });

  out = out.flatMap((text) => {
    const matches = [...text.matchAll(/(images.*)$/g)];
    return matches.map((match) => match[1]);
  });

  return out;
};
