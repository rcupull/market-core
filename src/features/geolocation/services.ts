import axios from 'axios';
import { Address, QueryHandle } from '../../types/general';
import { fixToTwoDigits } from '../../utils/general';
import { ConfigServices } from '../config/services';
import {
  GeoapifyResponse,
  GetGeolocationDistanceReturn,
  MapOlPosition,
  OsrmResponse
} from './types';
import { getOsrmEndpoint } from './utils';

/**
 * doc in https://project-osrm.org/docs/v5.24.0/api/#route-object
 */

export class GeolocationServices {
  constructor(
    private readonly configServices: ConfigServices,
    private readonly options: {
      GEOAPIFY_API_KEY: string;
    }
  ) {}

  /**
   * https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
   */
  private getDistanceBetweenPositions = (
    position1: MapOlPosition,
    position2: MapOlPosition
  ): number => {
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
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
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

  private getAproximatedDistance: QueryHandle<
    {
      fromAddress: Address;
      toAddress: Address;
    },
    GetGeolocationDistanceReturn
  > = async ({ fromAddress, toAddress }) => {
    const distance = this.getDistanceBetweenPositions(
      {
        lat: fromAddress.lat,
        lon: fromAddress.lon
      },
      {
        lat: toAddress.lat,
        lon: toAddress.lon
      }
    );

    return {
      distance,
      mapRoute: []
    };
  };

  private getOSRMGeolocationDistance: QueryHandle<
    {
      fromAddress: Address;
      toAddress: Address;
    },
    GetGeolocationDistanceReturn
  > = async ({ fromAddress, toAddress }) => {
    const { data } = await axios({
      method: 'get',
      url: getOsrmEndpoint({
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

    const response = data as OsrmResponse;
    const route = response.routes[0];

    return {
      distance: fixToTwoDigits(route.distance / 1000), // convert to km
      mapRoute: route.geometry?.coordinates?.map(([lon, lat]) => ({
        lat,
        lon
      }))
    };
  };

  getGeolocationDistance: QueryHandle<
    {
      fromAddress?: Address;
      toAddress?: Address;
    },
    GetGeolocationDistanceReturn
  > = async ({ fromAddress, toAddress }) => {
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

  getGeolocationReverse: QueryHandle<{ lat: number; lon: number }, GeoapifyResponse> = async ({
    lat,
    lon
  }) => {
    const { GEOAPIFY_API_KEY } = this.options;
    const response = await axios({
      method: 'get',
      url: 'https://api.geoapify.com/v1/geocode/reverse',
      params: {
        lat,
        lon,
        apiKey: GEOAPIFY_API_KEY
      }
    });

    const out: GeoapifyResponse = response.data;

    return out;
  };
}
