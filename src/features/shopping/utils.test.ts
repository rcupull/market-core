import { GetAllShoppingArgs, ShoppingDeliveryState, ShoppingState } from './types';
import { getAllFilterQuery } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllShoppingArgs = {
      routeNames: ['routeName1', 'routeName2'],
      states: Object.values(ShoppingState),
      stdeliveryStatesates: Object.values(ShoppingDeliveryState),
      deliveryManId: 'deliveryManId',

      shoppingIds: ['shoppingId1', 'shoppingId2'],
      excludeShoppingIds: ['shoppingId3', 'shoppingId4'],
      search: 'search',
      dateFrom: 'dateFrom',
      dateTo: 'dateTo'
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
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
