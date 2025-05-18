"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('getPathToSave', () => {
    it.each([
        [
            'users/userId',
            {
                userId: 'userId'
            }
        ],
        [
            'users/userId/customKey',
            {
                userId: 'userId',
                customKey: 'customKey'
            }
        ],
        [
            'business/routeName',
            {
                routeName: 'routeName'
            }
        ],
        [
            'business/routeName/customKey',
            {
                routeName: 'routeName',
                customKey: 'customKey'
            }
        ],
        [
            'business/routeName/posts/postId',
            {
                routeName: 'routeName',
                postId: 'postId'
            }
        ],
        [
            'business/routeName/posts/postId/customKey',
            {
                routeName: 'routeName',
                postId: 'postId',
                customKey: 'customKey'
            }
        ],
        [
            'customKey',
            {
                customKey: 'customKey'
            }
        ]
    ])('should return %p when value = %p', (expected, value) => {
        expect((0, utils_1.getPathToSave)(value)).toEqual(expected);
    });
});
