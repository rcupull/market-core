import { getPathToSave, GetPathToSaveArgs } from './utils';

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
  ] as Array<[string, GetPathToSaveArgs]>)(
    'should return %p when value = %p',
    (expected, value) => {
      expect(getPathToSave(value)).toEqual(expected);
    }
  );
});
