"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('getAllFilterQuery', () => {
    it('should return', () => {
        const args = {
            paymentIds: ['paymentId1', 'paymentId2']
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "_id": {
          "$in": [
            "paymentId1",
            "paymentId2",
          ],
        },
      }
    `);
    });
});
