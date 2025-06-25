export interface GetPathToSaveArgs {
    routeName?: string;
    postId?: string;
    professionalJobId?: string;
    userId?: string;
    customKey?: string;
}
export declare const getPathToSave: (args: GetPathToSaveArgs) => string;
