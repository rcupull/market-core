import { FilterQuery, Schema } from 'mongoose';
import { BaseIdentity, Image } from '../../types/general';
export interface ProfessionalJob extends BaseIdentity {
    images?: Array<Image>;
    routeName: string;
    createdBy: Schema.Types.ObjectId;
    description?: string;
    details?: string;
    name: string;
    professionalJobSlug: string;
    hidden?: boolean;
    hiddenBusiness?: boolean;
}
export interface GetAllProfessionalJobArgs extends FilterQuery<ProfessionalJob> {
    routeNames?: Array<string>;
    search?: string;
}
