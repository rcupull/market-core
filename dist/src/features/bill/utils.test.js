"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('getAllFilterQuery', () => {
    it('should return', () => {
        const args = {
            routeNames: ['routeName1', 'routeName2']
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "routeName": {
          "$in": [
            "routeName1",
            "routeName2",
          ],
        },
      }
    `);
    });
});
