"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const schemas_1 = require("./schemas");
const types_1 = require("./types");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class AuthServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter);
        this.close = async ({ refreshToken }) => {
            const Model = (0, schemas_1.modelGetter)();
            const authSession = await Model.findOneAndUpdate({
                refreshToken,
                state: types_1.AuthSessionState.OPEN
            }, {
                state: types_1.AuthSessionState.CLOSED,
                closedAt: new Date()
            }, {
                returnDocument: 'after'
            });
            return authSession;
        };
    }
}
exports.AuthServices = AuthServices;
