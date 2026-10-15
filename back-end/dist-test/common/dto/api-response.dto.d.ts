export declare class ApiResponseEnvelope<T> {
    success: boolean;
    data: T;
    timestamp: string;
    message?: string;
}
export declare class PaginatedResponseEnvelope<T> {
    success: boolean;
    data: {
        items: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    timestamp: string;
}
