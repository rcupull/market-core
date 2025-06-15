import { EmbeddedVector } from '../../utils/ModelCrudWithQdrant';
export interface ProductScore {
    score: number;
    productName: string;
}
export interface EmbeddedProductScore extends ProductScore {
    productId: string;
    vector: EmbeddedVector;
}
