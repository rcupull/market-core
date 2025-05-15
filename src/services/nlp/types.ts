import { AnyRecord } from '../../types/general';

export interface NlpClassification {
  intent: string;
  score: number;
}

export interface NplProcessResponse {
  locale: 'es';
  utterance: string;
  settings?: unknown;
  languageGuessed: boolean;
  localeIso2: 'es';
  language: string;
  nluAnswer: {
    classifications: Array<AnyRecord>;
    entities?: unknown;
    explanation?: unknown;
  };
  classifications: Array<NlpClassification>;
  intent: string;
  score: number;
  domain: 'default';
  entities: [];
  sourceEntities: [];
  answers: [];
  answer: undefined;
  actions: [];
  sentiment: {
    score: number;
    numWords: number;
    numHits: number;
    average: number;
    type: 'senticon';
    locale: 'es';
    vote: 'positive';
  };
}
