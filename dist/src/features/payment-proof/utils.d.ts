import { FilterQuery } from 'mongoose';
import { GetAllPaymentProofArgs, PaymentProof } from './types';
export declare const getAllFilterQuery: (args: GetAllPaymentProofArgs) => FilterQuery<PaymentProof>;
export declare const getPaymentProofCode: () => string;
