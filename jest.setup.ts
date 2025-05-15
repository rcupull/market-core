class AgendaDummy {
  constructor() {}

  define() {}
  every() {}
  on() {}
  schedule() {}
}

class QdrantClient {
  constructor() {}

  upsert() {}
  delete() {}
  createCollection() {}
  collectionExists() {}
  query() {}
}

jest.mock('agenda', () => AgendaDummy);
jest.mock('@qdrant/js-client-rest', () => ({ QdrantClient }));

global.afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.resetAllMocks();
});
