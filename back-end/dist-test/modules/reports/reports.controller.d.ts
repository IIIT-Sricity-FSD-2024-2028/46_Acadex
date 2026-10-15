import { ReportsService } from './reports.service';
import { GenerateReportDto, ReportQueryDto } from './dto/report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    findAll(query: ReportQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    generate(dto: GenerateReportDto): Promise<any>;
    exportReport(id: string): Promise<{
        reportId: any;
        title: any;
        type: any;
        generatedDate: any;
        recordCount: number;
        csvContent: string;
        dataset: any[];
    }>;
    delete(id: string): Promise<boolean>;
}
