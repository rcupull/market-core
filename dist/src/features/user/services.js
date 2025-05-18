"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const general_1 = require("../../utils/general");
class UserServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.getPurchasersData = async ({ query }) => {
            const usersData = await this.getAll({
                query,
                projection: { name: 1, addresses: 1, _id: 1, phone: 1 }
            });
            return {
                getOnePurchaserData: ({ purchaserId }) => {
                    var _a;
                    const userData = purchaserId && usersData.find((user) => (0, general_1.isEqualIds)(user._id, purchaserId));
                    if (userData) {
                        return {
                            purchaserName: userData.name,
                            purchaserAddress: (_a = userData.addresses) === null || _a === void 0 ? void 0 : _a[0],
                            purchaserPhone: userData.phone
                        };
                    }
                    return null;
                }
            };
        };
    }
}
exports.UserServices = UserServices;
