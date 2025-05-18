export interface GeoapifyResponse {
    type: 'FeatureCollection';
    features: [
        {
            type: 'Feature';
            geometry: {
                type: 'Point';
                coordinates: [number, number];
            };
            properties: {
                country_code: 'cu';
                name: string;
                housenumber: string;
                street: string;
                country: string;
                county: string;
                district: string;
                neighbourhood: string;
                suburb: string;
                datasource: {
                    sourcename: string;
                    attribution: string;
                    license: string;
                    url: string;
                };
                state: string;
                city: string;
                lon: number;
                lat: number;
                distance: number;
                result_type: string;
                postcode: string;
                formatted: string;
                address_line1: string;
                address_line2: string;
                timezone: {
                    name: string;
                    offset_STD: string;
                    offset_STD_seconds: number;
                    offset_DST: string;
                    offset_DST_seconds: number;
                    abbreviation_STD: string;
                    abbreviation_DST: string;
                };
                plus_code: string;
                plus_code_short: string;
                rank: {
                    popularity: number;
                };
                place_id: string;
            };
        }
    ];
    query: {
        lat: number;
        lon: number;
        plus_code: string;
    };
}
export declare const geoapifyResponseExample: GeoapifyResponse;
export interface GetGeolocationDistanceReturn {
    distance: number;
    mapRoute: MapOlPolyline;
}
export interface MapOlPosition {
    lon: number;
    lat: number;
}
export interface MapOlMarker extends MapOlPosition {
}
export type MapOlPolyline = Array<MapOlPosition>;
export interface OsrmResponse {
    code: string;
    routes: [
        {
            geometry: {
                coordinates: Array<[number, number]>;
                type: string;
            };
            legs: [
                {
                    steps: [];
                    summary: '';
                    weight: 224.9;
                    duration: 224.9;
                    distance: 2011.6;
                }
            ];
            weight_name: 'routability';
            weight: 224.9;
            duration: 224.9;
            distance: 2011.6;
        }
    ];
    waypoints: Array<{
        hint: string;
        distance: number;
        name: string;
        location: [number, number];
    }>;
}
