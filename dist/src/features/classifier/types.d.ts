import { BaseIdentity } from '../../types/general';
export declare enum ClassifierSearchType {
    SEARCH = "search",
    PROCESS = "process"
}
export declare enum ClassifierType {
    CATEGORY = "CATEGORY",
    DATE = "DATE",
    SORT = "SORT"
}
export interface Classifier extends BaseIdentity {
    label: string;
    tags?: string;
    hidden?: boolean;
    type: ClassifierType;
}
