import { PostDto } from '../post-dtos/types';

export enum NlpSearchReturnType {
  BUSINESS = 'BUSINESS',
  POST = 'POST'
}

export interface SearchPostDto extends PostDto {
  searchDtoReturnType: NlpSearchReturnType.POST;
  businessName: string | undefined;
}

export type SearchDto = SearchPostDto;
