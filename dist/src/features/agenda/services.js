"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaServices = void 0;
const agenda_1 = __importDefault(require("agenda"));
//@ts-expect-error ignore types
const agendash_1 = __importDefault(require("agendash"));
class AgendaServices {
    constructor(options) {
        this.options = options;
        this.define = (...args) => this.agenda.define(...args);
        //@ts-expect-error ignore
        this.schedule = (...args) => this.agenda.schedule(...args);
        this.cancel = (...args) => this.agenda.cancel(...args);
        this.every = (...args) => this.agenda.every(...args);
        this.jobs = (...args) => this.agenda.jobs(...args);
        this.start = (...args) => this.agenda.start(...args);
        this.on = (...args) => this.agenda.on(...args);
        const { MONGO_DB_URL } = this.options;
        this.agenda = new agenda_1.default({ db: { address: MONGO_DB_URL }, processEvery: '10 seconds' });
        this.agendashMiddleware = (0, agendash_1.default)(this.agenda);
    }
}
exports.AgendaServices = AgendaServices;
