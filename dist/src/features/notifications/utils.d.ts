import { FilterQuery, Schema } from 'mongoose';
import { PushNotification } from './types';
export interface GetAllNotificationsArgs extends FilterQuery<PushNotification> {
    userIds?: Array<Schema.Types.ObjectId | string>;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllNotificationsArgs>) => FilterQuery<GetAllNotificationsArgs>;
export declare const getNotificationsCredentials: () => {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
};
