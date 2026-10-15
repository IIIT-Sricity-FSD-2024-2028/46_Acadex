import { JsonRepository } from '../../database/json-repository';
import { GenerateReportDto, ReportQueryDto } from './dto/report.dto';
export declare class ReportsService {
    private readonly reportsRepo;
    private readonly enrollmentsRepo;
    private readonly transactionsRepo;
    private readonly coursesRepo;
    private readonly instructorsRepo;
    private readonly disputesRepo;
    constructor(reportsRepo: JsonRepository<any>, enrollmentsRepo: JsonRepository<any>, transactionsRepo: JsonRepository<any>, coursesRepo: JsonRepository<any>, instructorsRepo: JsonRepository<any>, disputesRepo: JsonRepository<any>);
    findAll(query: ReportQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    generate(dto: GenerateReportDto): Promise<any>;
    exportReportData(id: string): Promise<{
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
