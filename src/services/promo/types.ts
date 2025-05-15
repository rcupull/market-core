import { Schema } from 'mongoose';
import { BaseIdentity, Image } from '../../types/general';

export enum PromoEntityType {
  PRODUCT = 'PRODUCT'
}

export interface Promo extends BaseIdentity {
  name: string;
  description?: string;
  image?: Image;
  entityType: PromoEntityType;
  entityId: Schema.Types.ObjectId;
}

export interface PromoDto extends Promo {
  routeName: string | undefined;
  postSlug: string | undefined;
}
