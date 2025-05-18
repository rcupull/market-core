import { EmbeddedVector } from '../../utils/ModelCrudWithQdrant';
import { PostDto } from '../post/types';

export enum NlpSearchReturnType {
  BUSINESS = 'BUSINESS',
  POST = 'POST'
}

export interface SearchPostDto extends PostDto {
  searchDtoReturnType: NlpSearchReturnType.POST;
  businessName: string | undefined;
}

export type SearchDto = SearchPostDto;

export interface ProductScore {
  score: number;
  productName: string;
}

export interface EmbeddedProductScore extends ProductScore {
  productId: string;
  vector: EmbeddedVector;
}
