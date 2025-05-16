import { Mongoose } from 'mongoose';

let sharedMongoose: Mongoose;

export const injectMongoose = (m: Mongoose) => {
  sharedMongoose = m;
};

export const getMongoose = (): Mongoose => {
  if (!sharedMongoose) {
    throw new Error('Mongoose not injected');
  }
  return sharedMongoose;
};
