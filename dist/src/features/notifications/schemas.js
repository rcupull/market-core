"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const db_1 = require("../../db");
const schemas_1 = require("../../utils/schemas");
let PushNotificationModel;
const modelGetter = () => {
    if (!PushNotificationModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const PushNotificationShema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            type: { type: String, required: true },
            userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            readBys: { type: Object },
            businessName: { type: String },
            postId: { type: Schema.Types.ObjectId, ref: 'Post' },
            routeName: { type: String },
            shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping' },
            shoppingCode: { type: String },
            stockAmountAvailable: { type: Number },
            meta: { type: Schema.Types.Mixed },
            paymentProofCode: { type: String },
            message: { type: String },
            paymentProofId: { type: Schema.Types.ObjectId, ref: 'PaymentProof' }
        });
        PushNotificationModel = (0, schemas_1.getMongoModel)('PushNotification', PushNotificationShema, 'push_notification');
    }
    return PushNotificationModel;
};
exports.modelGetter = modelGetter;
