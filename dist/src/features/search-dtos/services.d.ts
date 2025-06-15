import { BusinessServices } from '../business/services';
import { PostServices } from '../post/services';
import { Post } from '../post/types';
import { ShoppingServices } from '../shopping/services';
import { SearchDto } from './types';
export declare class SearchDtosServices {
    private readonly businessServices;
    private readonly shoppingServices;
    private readonly postServices;
    constructor(businessServices: BusinessServices, shoppingServices: ShoppingServices, postServices: PostServices);
    private getPostsResources;
    getSearchDto: (posts: Array<Post>) => Promise<Array<SearchDto>>;
}
