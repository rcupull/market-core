import Agendash from 'agendash';
export declare class AgendaServices {
    private readonly options;
    private agenda;
    agendashMiddleware: Agendash;
    constructor(options: {
        MONGO_DB_URL: string;
    });
    define: typeof this.agenda.define;
    schedule: typeof this.agenda.schedule;
    cancel: typeof this.agenda.cancel;
    every: typeof this.agenda.every;
    jobs: typeof this.agenda.jobs;
    start: typeof this.agenda.start;
    on: typeof this.agenda.on;
}
