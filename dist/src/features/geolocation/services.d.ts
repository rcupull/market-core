import { Address, QueryHandle } from '../../types/general';
import { ConfigServices } from '../config/services';
import { GeoapifyResponse, GetGeolocationDistanceReturn } from './types';
/**
 * doc in https://project-osrm.org/docs/v5.24.0/api/#route-object
 */
export declare class GeolocationServices {
    private readonly configServices;
    private readonly options;
    constructor(configServices: ConfigServices, options: {
        GEOAPIFY_API_KEY: string;
    });
    /**
     * https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
     */
    private getDistanceBetweenPositions;
    private getAproximatedDistance;
    private getOSRMGeolocationDistance;
    getGeolocationDistance: QueryHandle<{
        fromAddress?: Address;
        toAddress?: Address;
    }, GetGeolocationDistanceReturn>;
    getGeolocationReverse: QueryHandle<{
        lat: number;
        lon: number;
    }, GeoapifyResponse>;
}
