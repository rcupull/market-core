"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('getAllFilterQuery', () => {
    it('hidden = true', () => {
        const args = {
            routeNames: ['routeName1', 'routeName2'],
            search: 'search',
            hidden: true
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "$or": [
          {
            "name": {
              "$options": "i",
              "$regex": /search/,
            },
          },
          {
            "postCategories": {
              "$elemMatch": {
                "label": {
                  "$options": "i",
                  "$regex": /search/,
                },
              },
            },
          },
        ],
        "hidden": true,
        "routeName": {
          "$in": [
            "routeName1",
            "routeName2",
          ],
        },
      }
    `);
    });
    it('hidden = false', () => {
        const args = {
            routeNames: ['routeName1', 'routeName2'],
            search: 'search',
            hidden: false
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "$or": [
          {
            "name": {
              "$options": "i",
              "$regex": /search/,
            },
          },
          {
            "postCategories": {
              "$elemMatch": {
                "label": {
                  "$options": "i",
                  "$regex": /search/,
                },
              },
            },
          },
        ],
        "hidden": false,
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
