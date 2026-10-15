export declare enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
}
