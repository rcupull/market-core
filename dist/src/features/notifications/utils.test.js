"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('getAllFilterQuery', () => {
    it('should return', () => {
        const args = {
            userIds: ['userId1', 'userId2']
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "userIds": {
          "$in": [
            "userId1",
            "userId2",
          ],
        },
      }
    `);
    });
});
