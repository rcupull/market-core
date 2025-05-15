import { getAllFilterQuery, GetAllClassifiersArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllClassifiersArgs = {};

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`{}`);
  });
});
