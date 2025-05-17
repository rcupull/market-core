export declare enum CommissionMode {
    PERCENT = "PERCENT"
}
export interface Commission {
    mode: CommissionMode;
    value: number;
}
export interface Commissions {
    systemUse: Commission;
    marketOperation: Commission;
}
