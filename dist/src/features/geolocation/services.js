"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocationServices = void 0;
const axios_1 = __importDefault(require("axios"));
const general_1 = require("../../utils/general");
const utils_1 = require("./utils");
/**
 * doc in https://project-osrm.org/docs/v5.24.0/api/#route-object
 */
class GeolocationServices {
    constructor(configServices, options) {
        this.configServices = configServices;
        this.options = options;
        /**
         * https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
         */
        this.getDistanceBetweenPositions = (position1, position2) => {
            const lat1 = position1.lat;
            const lat2 = position2.lat;
            const lon1 = position1.lon;
            const lon2 = position2.lon;
            if (lat1 == lat2 && lon1 == lon2) {
                return 0;
            }
            const radlat1 = (Math.PI * lat1) / 180;
            const radlat2 = (Math.PI * lat2) / 180;
            const theta = lon1 - lon2;
            const radtheta = (Math.PI * theta) / 180;
            let dist = Math.sin(radlat1) * Math.sin(radlat2) +
                Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = (dist * 180) / Math.PI;
            dist = dist * 60 * 1.1515;
            dist = dist * 1.609344;
            return Number(dist.toFixed(2));
        };
        this.getAproximatedDistance = async ({ fromAddress, toAddress }) => {
            const distance = this.getDistanceBetweenPositions({
                lat: fromAddress.lat,
                lon: fromAddress.lon
            }, {
                lat: toAddress.lat,
                lon: toAddress.lon
            });
            return {
                distance,
                mapRoute: []
            };
        };
        this.getOSRMGeolocationDistance = async ({ fromAddress, toAddress }) => {
            var _a, _b;
            const { data } = await (0, axios_1.default)({
                method: 'get',
                url: (0, utils_1.getOsrmEndpoint)({
                    profile: 'driving',
                    service: 'route',
                    coordinates: {
                        destination: {
                            lon: toAddress.lon,
                            lat: toAddress.lat
                        },
                        origin: {
                            lon: fromAddress.lon,
                            lat: fromAddress.lat
                        }
                    }
                }),
                params: {
                    geometries: 'geojson',
                    overview: 'full'
                }
            });
            const response = data;
            const route = response.routes[0];
            return {
                distance: (0, general_1.fixToTwoDigits)(route.distance / 1000), // convert to km
                mapRoute: (_b = (_a = route.geometry) === null || _a === void 0 ? void 0 : _a.coordinates) === null || _b === void 0 ? void 0 : _b.map(([lon, lat]) => ({
                    lat,
                    lon
                }))
            };
        };
        this.getGeolocationDistance = async ({ fromAddress, toAddress }) => {
            if (!fromAddress || !toAddress) {
                return {
                    distance: 0,
                    mapRoute: []
                };
            }
            const { getEnabledFeature } = await this.configServices.features();
            if (getEnabledFeature('COMPUTE_DELIVERY_DISTANCE_USING_OSRM_SERVICES')) {
                return await this.getOSRMGeolocationDistance({ fromAddress, toAddress });
            }
            return await this.getAproximatedDistance({ fromAddress, toAddress });
        };
        this.getGeolocationReverse = async ({ lat, lon }) => {
            const { GEOAPIFY_API_KEY } = this.options;
            const response = await (0, axios_1.default)({
                method: 'get',
                url: 'https://api.geoapify.com/v1/geocode/reverse',
                params: {
                    lat,
                    lon,
                    apiKey: GEOAPIFY_API_KEY
                }
            });
            const out = response.data;
            return out;
        };
    }
}
exports.GeolocationServices = GeolocationServices;
