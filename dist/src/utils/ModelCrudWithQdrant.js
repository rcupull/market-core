"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCrudWithQdrant = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const ModelCrudTemplate_1 = require("./ModelCrudTemplate");
const general_1 = require("./general");
const axios_1 = __importDefault(require("axios"));
class ModelCrudWithQdrant extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(modelGetter, getFilterQuery = (q) => q, options) {
        super(modelGetter, getFilterQuery);
        this.options = options;
        this.getCollectionName = (customCollectionName) => {
            const { NODE_ENV, QDRANT_ENV } = this.options;
            return `${NODE_ENV}_${QDRANT_ENV}_${customCollectionName}`;
        };
        this.checkCollection = async (collectionName) => {
            const existsProductsCollection = await this.qdrantClient.collectionExists(collectionName);
            if (!existsProductsCollection.exists) {
                await this.qdrantClient.createCollection(collectionName, {
                    vectors: { size: 384, distance: 'Cosine' }
                });
            }
        };
        this.embed = async ({ text }) => {
            var _a, _b;
            const { EMBEDDING_HOST } = this.options;
            try {
                const { data } = await (0, axios_1.default)({
                    method: 'get',
                    url: `${EMBEDDING_HOST}/embed`,
                    params: { text }
                });
                return {
                    embedding: data.embedding
                };
            }
            catch (e) {
                (_a = this.options.logger) === null || _a === void 0 ? void 0 : _a.error('Failed call to Embedding provider');
                (_b = this.options.logger) === null || _b === void 0 ? void 0 : _b.error(e);
                return {
                    embedding: []
                };
            }
        };
        this.qdrantUpdateAllVectors = async (customCollectionName, { query, getTextFromDoc }) => {
            var _a, _b;
            /**
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             */
            const collectionName = this.getCollectionName(customCollectionName);
            await this.checkCollection(collectionName);
            /**
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             */
            const documents = await this.getAll({ query });
            try {
                const getPoint = async (document, index) => {
                    const text = await getTextFromDoc(document);
                    if (!text)
                        return null;
                    const { embedding } = await this.embed({ text });
                    const payload = await this.options.payloadFromDoc(document);
                    return {
                        id: index,
                        vector: embedding,
                        payload: payload
                    };
                };
                const points = await Promise.all(documents.map(getPoint));
                await this.qdrantClient.delete(collectionName, {
                    filter: {} // //Remove all the points
                });
                await this.qdrantClient.upsert(collectionName, {
                    wait: true,
                    points: (0, general_1.compact)(points)
                });
            }
            catch (e) {
                (_a = this.options.logger) === null || _a === void 0 ? void 0 : _a.error('Failed calling upsert to Qdrant');
                (_b = this.options.logger) === null || _b === void 0 ? void 0 : _b.error(JSON.stringify(e, null, 2));
            }
        };
        this.qdrantSearch = async (customCollectionName, { search, limit, vector }) => {
            var _a, _b;
            /**
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             */
            const collectionName = this.getCollectionName(customCollectionName);
            await this.checkCollection(collectionName);
            /**
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             */
            try {
                const query = await (async () => {
                    if (search) {
                        const { embedding } = await this.embed({ text: search });
                        return embedding;
                    }
                    if (vector) {
                        return vector;
                    }
                    return [];
                })();
                const { points } = await this.qdrantClient.query(collectionName, {
                    query,
                    with_payload: true,
                    with_vector: true,
                    limit: limit || 20
                });
                return points.map(({ score, payload, vector, id }) => ({
                    id,
                    score,
                    vector: vector,
                    payload: payload
                }));
            }
            catch (e) {
                (_a = this.options.logger) === null || _a === void 0 ? void 0 : _a.error('Failed calling search to Qdrant');
                (_b = this.options.logger) === null || _b === void 0 ? void 0 : _b.error(JSON.stringify(e, null, 2));
                return [];
            }
        };
        this.qdrantSearchOne = async (customCollectionName, { query }) => {
            var _a, _b;
            /**
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             */
            const collectionName = this.getCollectionName(customCollectionName);
            await this.checkCollection(collectionName);
            /**
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             * ///////////////////////////////////////////////////////////////
             */
            try {
                const { points } = await this.qdrantClient.scroll(collectionName, {
                    limit: 1,
                    with_payload: true,
                    with_vector: true,
                    filter: {
                        must: Object.entries(query).map(([k, v]) => ({
                            key: k,
                            match: {
                                value: v
                            }
                        }))
                    }
                });
                if (!points.length) {
                    return null;
                }
                return points[0];
            }
            catch (e) {
                (_a = this.options.logger) === null || _a === void 0 ? void 0 : _a.error('Failed calling qdrantSearchOne to Qdrant');
                (_b = this.options.logger) === null || _b === void 0 ? void 0 : _b.error(JSON.stringify(e, null, 2));
                return null;
            }
        };
        const { QDRANT_HOST, QDRANT_API_KEY } = this.options;
        this.qdrantClient = new js_client_rest_1.QdrantClient({ url: QDRANT_HOST, apiKey: QDRANT_API_KEY });
    }
}
exports.ModelCrudWithQdrant = ModelCrudWithQdrant;
