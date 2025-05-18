"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const utils_1 = require("./utils");
describe('getAllFilterQuery', () => {
    it('should return', () => {
        const args = {
            routeNames: ['routeName1', 'routeName2'],
            states: Object.values(types_1.ShoppingState),
            stdeliveryStatesates: Object.values(types_1.ShoppingDeliveryState),
            deliveryManId: 'deliveryManId',
            shoppingIds: ['shoppingId1', 'shoppingId2'],
            excludeShoppingIds: ['shoppingId3', 'shoppingId4'],
            search: 'search',
            dateFrom: 'dateFrom',
            dateTo: 'dateTo'
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "$and": [
          {
            "_id": {
              "$in": [
                "shoppingId1",
                "shoppingId2",
              ],
            },
          },
          {
            "_id": {
              "$nin": [
                "shoppingId3",
                "shoppingId4",
              ],
            },
          },
        ],
        "code": {
          "$options": "i",
          "$regex": /search/,
        },
        "createdAt": {
          "$gte": Date { NaN },
          "$lte": Date { NaN },
        },
        "requestedDelivery.deliveryManId": "deliveryManId",
        "routeName": {
          "$in": [
            "routeName1",
            "routeName2",
          ],
        },
        "state": {
          "$in": [
            "CONSTRUCTION",
            "REQUESTED",
            "APPROVED",
            "READY_TO_DELIVERY",
            "DELIVERED",
            "CANCELED",
            "REJECTED",
          ],
        },
        "stdeliveryStatesates": [
          "NOT_ASSIGNED",
          "NOT_STARTED",
          "IN_PROGRESS",
          "FINISHED",
        ],
      }
    `);
    });
});
