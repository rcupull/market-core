"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('getAllFilterQuery', () => {
    it('should return', () => {
        const args = {
            search: 'search'
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "$or": [
          {
            "label": {
              "$options": "i",
              "$regex": /search/,
            },
          },
          {
            "productNames": {
              "$options": "i",
              "$regex": /search/,
            },
          },
        ],
      }
    `);
    });
});
