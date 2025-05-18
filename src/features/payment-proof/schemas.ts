import { PaymentProof } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { getPaymentProofCode } from './utils';
import { getMongoose } from '../../db';

let PaymentProofModel: ReturnType<typeof getMongoModel<PaymentProof>>;

export const modelGetter = () => {
  if (!PaymentProofModel) {
    const { Schema } = getMongoose();

    const PaymentProofSchema = new Schema<PaymentProof>({
      ...createdAtSchemaDefinition,
      //
      code: { type: String, required: true, default: getPaymentProofCode },
      customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping', required: true }
    });

    PaymentProofModel = getMongoModel<PaymentProof>(
      'PaymentProof',
      PaymentProofSchema,
      'payment_proofs'
    );
  }

  return PaymentProofModel;
};
