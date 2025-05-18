"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const types_1 = require("./types");
const schemas_1 = require("../../utils/schemas");
const schemas_2 = require("../post/schemas");
const general_1 = require("../../types/general");
const mongoose_1 = require("mongoose");
let BusinessModel;
const modelGetter = () => {
    if (!BusinessModel) {
        const BusinessSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            name: { type: String, required: true },
            routeName: { type: String, required: true, unique: true },
            hidden: { type: Boolean, default: false },
            currency: { type: String, enum: Object.values(general_1.Currency), default: general_1.Currency.CUP },
            customCommissions: { type: Boolean },
            commissions: {
                products: {
                    type: schemas_1.commissionsSchemaDefinition
                },
                delivery: {
                    type: schemas_1.commissionsSchemaDefinition
                }
            },
            businessType: {
                type: String,
                enum: Object.values(types_1.BusinessType),
                default: types_1.BusinessType.BUSINESS_FULL
            },
            createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            postCategories: {
                type: [
                    {
                        label: { type: String, required: true },
                        hidden: { type: Boolean, default: false }
                    }
                ],
                required: true
            },
            bannerImages: {
                type: [
                    {
                        src: { type: String, required: true },
                        width: { type: Number, required: true },
                        height: { type: Number, required: true },
                        href: { type: String }
                    }
                ],
                default: []
            },
            logo: {
                type: {
                    src: { type: String, required: true },
                    width: { type: Number, required: true },
                    height: { type: Number, required: true }
                },
                default: null
            },
            socialLinks: {
                face: { type: String },
                instagram: { type: String },
                twitter: { type: String },
                linkedin: { type: String },
                youtube: { type: String }
            },
            layouts: {
                banner: {
                    type: {
                        type: String,
                        enum: ['none', 'static', 'swipableClassic'],
                        default: 'none'
                    }
                },
                posts: {
                    _id: false,
                    type: {
                        sections: {
                            type: [
                                {
                                    name: { type: String },
                                    hiddenName: { type: Boolean, default: false },
                                    showMobile: { type: Boolean, default: false },
                                    showPC: { type: Boolean, default: false },
                                    searchLayout: {
                                        type: String,
                                        enum: [
                                            'none',
                                            'left',
                                            'center',
                                            'right',
                                            'postCategories',
                                            'postCategoriesScrollable',
                                            'postCategoriesExcluded',
                                            'postCategoriesExcludedScrollable'
                                        ],
                                        default: 'none'
                                    },
                                    postCategoriesLabels: { type: [String] },
                                    type: {
                                        type: String,
                                        enum: ['grid', 'oneRowSlider'],
                                        default: 'grid'
                                    },
                                    postCardLayout: {
                                        type: schemas_1.PostCardLayoutSchema
                                    },
                                    postType: {
                                        type: String,
                                        enum: ['product', 'link'],
                                        required: true,
                                        default: 'product'
                                    }
                                }
                            ],
                            default: []
                        }
                    },
                    default: {}
                },
                footer: {
                    type: {
                        type: String,
                        enum: ['none', 'basic'],
                        default: 'basic'
                    }
                },
                search: {
                    type: {
                        type: String,
                        enum: [
                            'none',
                            'left',
                            'center',
                            'right',
                            'postCategories',
                            'postCategoriesExcluded',
                            'postCategoriesScrollable',
                            'postCategoriesExcludedScrollable'
                        ],
                        default: 'right'
                    }
                }
            },
            aboutUsPage: {
                visible: { type: Boolean, default: false },
                title: { type: String },
                description: { type: String }
            },
            phoneNumber: { type: String },
            notificationFlags: {
                type: [
                    {
                        type: String,
                        enum: Object.values(types_1.BusinessNotificationFlags)
                    }
                ],
                default: [types_1.BusinessNotificationFlags.NEW_SHOPPING]
            },
            shoppingMeta: {
                termsAndConditions: { type: String }
            },
            postFormFields: {
                type: [
                    {
                        type: String,
                        enum: Object.values(types_1.PostFormField)
                    }
                ],
                default: []
            },
            seo: {
                title: { type: String },
                description: { type: String }
            },
            addresses: [schemas_1.AddressDefinition],
            deliveryConfig: schemas_1.DeliveryConfigDefinition,
            favoritesUserIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
            checks: { type: mongoose_1.Schema.Types.Mixed },
            bankAccountCUP: {
                _id: false,
                type: schemas_1.BankAccountDefinition
            },
            bankAccountMLC: {
                _id: false,
                type: schemas_1.BankAccountDefinition
            },
            billing: {
                type: {
                    accountNumber: { type: String },
                    bankNumber: { type: String },
                    nit: { type: String },
                    name: { type: String },
                    address: { type: schemas_1.AddressDefinition },
                    identityNumber: { type: String }
                },
                select: false
            },
            allowedOnlyCUPinCash: { type: Boolean }
        });
        BusinessSchema.pre('updateOne', async function (next) {
            //@ts-expect-error ignored
            const { hidden } = this.getUpdate();
            const { routeName } = this.getQuery();
            const PostModel = (0, schemas_2.modelGetter)();
            if (hidden !== undefined) {
                await PostModel.updateMany({
                    routeName
                }, {
                    hiddenBusiness: hidden
                });
            }
            next();
        });
        BusinessModel = (0, schemas_1.getMongoModel)('Business', BusinessSchema, 'business');
    }
    return BusinessModel;
};
exports.modelGetter = modelGetter;
