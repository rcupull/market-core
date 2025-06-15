import { BusinessServices } from '../business/services';
import { PostServices } from '../post/services';
import { Post } from '../post/types';
import { ShoppingServices } from '../shopping/services';
import { PostDto } from './types';
export declare class PostDtosServices {
    private readonly businessServices;
    private readonly shoppingServices;
    private readonly postServices;
    constructor(businessServices: BusinessServices, shoppingServices: ShoppingServices, postServices: PostServices);
    private getPostsResources;
    getPostsDto: (posts: Array<Post>) => Promise<Array<PostDto>>;
    getPostsOwnerDto: (posts: Array<Post>) => Promise<Array<PostDto>>;
}
