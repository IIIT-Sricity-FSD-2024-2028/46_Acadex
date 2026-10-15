import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare enum ReportType {
    ENROLLMENT_REPORT = "Enrollment Report",
    FINANCIAL_REPORT = "Financial Report",
    PERFORMANCE_REPORT = "Performance Report",
    AUDIT_LOG = "Audit Log"
}
export declare enum ReportFormat {
    CSV = "CSV",
    JSON = "JSON",
    PDF = "PDF"
}
export declare class GenerateReportDto {
    title: string;
    type: string;
    format?: ReportFormat;
}
export declare class ReportQueryDto extends PaginationQueryDto {
    type?: string;
}
