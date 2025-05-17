import Agenda from 'agenda';

//@ts-expect-error ignore types
import Agendash from 'agendash';

export class AgendaServices {
  private agenda: Agenda;
  public agendashMiddleware: Agendash;

  constructor(
    private readonly options: {
      MONGO_DB_URL: string;
    }
  ) {
    const { MONGO_DB_URL } = this.options;

    this.agenda = new Agenda({ db: { address: MONGO_DB_URL }, processEvery: '10 seconds' });
    this.agendashMiddleware = Agendash(this.agenda);
  }

  define: typeof this.agenda.define = (...args) => this.agenda.define(...args);
  //@ts-expect-error ignore
  schedule: typeof this.agenda.schedule = (...args) => this.agenda.schedule(...args);
  cancel: typeof this.agenda.cancel = (...args) => this.agenda.cancel(...args);
  every: typeof this.agenda.every = (...args) => this.agenda.every(...args);
  jobs: typeof this.agenda.jobs = (...args) => this.agenda.jobs(...args);
  start: typeof this.agenda.start = (...args) => this.agenda.start(...args);
  on: typeof this.agenda.on = (...args) => this.agenda.on(...args);
}
