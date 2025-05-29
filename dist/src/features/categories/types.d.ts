import { BaseIdentity, Image } from '../../types/general';
export interface SubCategory extends BaseIdentity {
    label: string;
    description: string;
}
export interface Category extends BaseIdentity {
    label: string;
    categorySlug: string;
    categoryImages?: Array<Image> | null;
    subCategories: Array<SubCategory>;
    subProductsAmounts: Array<number>;
}
