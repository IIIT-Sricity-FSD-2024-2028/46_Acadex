"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const json_repository_1 = require("../../database/json-repository");
const report_dto_1 = require("./dto/report.dto");
let ReportsService = class ReportsService {
    constructor(reportsRepo, enrollmentsRepo, transactionsRepo, coursesRepo, instructorsRepo, disputesRepo) {
        this.reportsRepo = reportsRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.transactionsRepo = transactionsRepo;
        this.coursesRepo = coursesRepo;
        this.instructorsRepo = instructorsRepo;
        this.disputesRepo = disputesRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, type, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.type = type;
        if (search) {
            where.$or = [
                { title: { $contains: search } },
                { type: { $contains: search } },
                { format: { $contains: search } },
            ];
        }
        return this.reportsRepo.findAndCount({
            where,
            skip,
            limit,
            sort: { [sortBy]: sortOrder },
        });
    }
    async findOne(id) {
        const report = await this.reportsRepo.findById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID '${id}' not found`);
        }
        return report;
    }
    async generate(dto) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const nowIso = now.toISOString();
        const newId = `rep-${Date.now()}`;
        const format = dto.format || report_dto_1.ReportFormat.CSV;
        const newReport = await this.reportsRepo.create({
            id: newId,
            title: dto.title,
            type: dto.type,
            date: dateStr,
            size: '3.6 MB',
            format: format === report_dto_1.ReportFormat.CSV ? 'CSV / XLSX' : format,
            createdAt: nowIso,
        });
        return newReport;
    }
    async exportReportData(id) {
        const report = await this.findOne(id);
        let csvContent = '';
        let dataset = [];
        switch (report.type) {
            case report_dto_1.ReportType.ENROLLMENT_REPORT: {
                const enrollments = await this.enrollmentsRepo.find();
                dataset = enrollments;
                csvContent = 'Enrollment ID,Learner Name,Course Title,Enrolled Date,Progress,Status\n';
                enrollments.forEach((e) => {
                    csvContent += `"${e.id}","${e.learnerName}","${e.courseTitle}","${e.enrolledDate}","${e.progress}%","${e.status}"\n`;
                });
                break;
            }
            case report_dto_1.ReportType.FINANCIAL_REPORT: {
                const transactions = await this.transactionsRepo.find();
                dataset = transactions;
                csvContent = 'Transaction ID,Type,Payer,Course/Purpose,Amount,Payment Method,Date,Status\n';
                transactions.forEach((t) => {
                    csvContent += `"${t.id}","${t.type}","${t.payer}","${t.course}","${t.amount}","${t.method}","${t.date}","${t.status}"\n`;
                });
                break;
            }
            case report_dto_1.ReportType.PERFORMANCE_REPORT: {
                const courses = await this.coursesRepo.find();
                dataset = courses;
                csvContent = 'Course ID,Title,Category,Level,Instructors,Price,Enrolled Count,Rating,Status\n';
                courses.forEach((c) => {
                    csvContent += `"${c.id}","${c.title}","${c.category}","${c.level}","${c.instructorName}","${c.price}","${c.enrolledCount}","${c.rating}","${c.status}"\n`;
                });
                break;
            }
            case report_dto_1.ReportType.AUDIT_LOG:
            default: {
                const disputes = await this.disputesRepo.find();
                dataset = disputes;
                csvContent = 'Dispute ID,Raised By,Role,Type,Subject,Priority,Status,Created At,Resolved At\n';
                disputes.forEach((d) => {
                    csvContent += `"${d.id}","${d.raisedBy}","${d.raisedByRole}","${d.disputeType}","${d.subject}","${d.priority}","${d.status}","${d.createdAt}","${d.resolvedAt || 'N/A'}"\n`;
                });
                break;
            }
        }
        return {
            reportId: report.id,
            title: report.title,
            type: report.type,
            generatedDate: report.date,
            recordCount: dataset.length,
            csvContent,
            dataset,
        };
    }
    async delete(id) {
        const report = await this.reportsRepo.findById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID '${id}' not found`);
        }
        return this.reportsRepo.delete(id);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.REPORTS)),
    __param(1, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.ENROLLMENTS)),
    __param(2, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.TRANSACTIONS)),
    __param(3, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.COURSES)),
    __param(4, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.INSTRUCTORS)),
    __param(5, (0, common_1.Inject)(database_module_1.REPOSITORY_TOKENS.DISPUTES)),
    __metadata("design:paramtypes", [json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository,
        json_repository_1.JsonRepository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map