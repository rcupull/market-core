"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const mongoose_1 = require("mongoose");
const schemas_1 = require("../../utils/schemas");
let PushNotificationModel;
const modelGetter = () => {
    if (!PushNotificationModel) {
        const PushNotificationShema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            type: { type: String, required: true },
            userIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
            readBys: { type: Object },
            businessName: { type: String },
            postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post' },
            routeName: { type: String },
            shoppingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shopping' },
            shoppingCode: { type: String },
            stockAmountAvailable: { type: Number },
            meta: { type: mongoose_1.Schema.Types.Mixed },
            paymentProofCode: { type: String },
            message: { type: String },
            paymentProofId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PaymentProof' }
        });
        PushNotificationModel = (0, schemas_1.getMongoModel)('PushNotification', PushNotificationShema, 'push_notification');
    }
    return PushNotificationModel;
};
exports.modelGetter = modelGetter;
