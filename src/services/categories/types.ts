import { BaseIdentity, Image } from '../../types/general';

export interface SubCategory extends BaseIdentity {
  label: string;
  description: string;
}

export interface Category extends BaseIdentity {
  label: string;
  categoryImage?: Image | null;
  subCategories: Array<SubCategory>;
  subProductsAmounts: Array<number>;
}
