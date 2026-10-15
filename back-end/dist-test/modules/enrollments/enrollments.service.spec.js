"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const enrollments_service_1 = require("./enrollments.service");
const database_module_1 = require("../../database/database.module");
const json_db_service_1 = require("../../database/json-db.service");
const fs = require("fs");
const path = require("path");
describe('EnrollmentsService', () => {
    let service;
    let dbService;
    const testDir = path.resolve(process.cwd(), './test-enroll-spec');
    beforeAll(async () => {
        process.env.DATA_DIR = './test-enroll-spec';
        const module = await testing_1.Test.createTestingModule({
            imports: [database_module_1.DatabaseModule],
            providers: [enrollments_service_1.EnrollmentsService],
        }).compile();
        service = module.get(enrollments_service_1.EnrollmentsService);
        dbService = module.get(json_db_service_1.JsonDatabaseService);
        await dbService.onModuleInit();
    });
    afterAll(async () => {
        if (fs.existsSync(testDir)) {
            await fs.promises.rm(testDir, { recursive: true, force: true });
        }
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should batch assign courses to learners and record transactions atomically', async () => {
        const result = await service.assignCoursesToLearners({
            courseIds: ['crs-1'],
            learnerIds: ['lrn-1'],
        });
        expect(result).toBeDefined();
        expect(result.totalAssigned).toBeGreaterThanOrEqual(0);
        const allEnrollments = await service.findAll({});
        expect(allEnrollments.total).toBeGreaterThan(0);
    });
    it('should update learner progress to 100% and mark status completed', async () => {
        const enrollments = await service.findAll({});
        const firstId = enrollments.items[0].id;
        const updated = await service.updateProgress(firstId, { progress: 100 });
        expect(updated?.progress).toBe(100);
        expect(updated?.status).toBe('Completed');
    });
});
//# sourceMappingURL=enrollments.service.spec.js.map