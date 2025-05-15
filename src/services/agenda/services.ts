import Agenda from 'agenda';

import { MONGO_DB_URL } from '../../config';

export class AgendaServices {
  constructor() {}

  public agenda = new Agenda({ db: { address: MONGO_DB_URL }, processEvery: '10 seconds' });
}
