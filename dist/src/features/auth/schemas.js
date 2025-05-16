"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const types_1 = require("./types");
const schemas_1 = require("../../utils/schemas");
const db_1 = require("../../db");
let AuthSessionModel;
const modelGetter = () => {
    if (!AuthSessionModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const AuthSessionShema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            refreshToken: { type: String, required: true, unique: true },
            typeDevice: { type: String, enum: Object.values(types_1.TYPE_DEVICE), required: true },
            descriptionDevice: { type: String, required: true },
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            refreshHistory: { type: [Date], default: [] },
            state: {
                type: String,
                enum: Object.values(types_1.AuthSessionState),
                default: types_1.AuthSessionState.OPEN,
                required: true
            },
            closedAt: { type: Date },
            firebaseToken: { type: String, select: false }
        });
        AuthSessionModel = (0, schemas_1.getMongoModel)('AuthSession', AuthSessionShema, 'auth_sessions');
    }
    return AuthSessionModel;
};
exports.modelGetter = modelGetter;
