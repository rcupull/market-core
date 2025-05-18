import { GetAllClassifiersArgs } from '../classifier/utils';
import { getAllFilterQuery } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllClassifiersArgs = {};

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`{}`);
  });
});
