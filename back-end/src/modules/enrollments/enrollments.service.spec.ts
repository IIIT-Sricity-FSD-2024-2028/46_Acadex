import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { DatabaseModule, REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonDatabaseService } from '../../database/json-db.service';
import * as fs from 'fs';
import * as path from 'path';
import { OrganizationModule } from '../organization/organization.module';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let dbService: JsonDatabaseService;
  const testDir = path.resolve(process.cwd(), './test-enroll-spec');

  const previousDataDir=process.env.DATA_DIR;
  beforeAll(async () => {
    process.env.DATA_DIR = './test-enroll-spec';
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, OrganizationModule],
      providers: [EnrollmentsService],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    dbService = module.get<JsonDatabaseService>(JsonDatabaseService);
    await dbService.onModuleInit();
    await dbService.setCollection('courses',[{id:'assignment-course',title:'Assignment test course',price:10,currency:'INR',organizationId:'org-101',instructorId:'inst-1',status:'Published'}]);
    await dbService.setCollection('enrollments',[]);
  });

  afterAll(async () => {
    if(previousDataDir===undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR=previousDataDir;
    if (fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should batch assign courses to learners and record transactions atomically', async () => {
    const result = await service.assignCoursesToLearners({
      courseIds: ['assignment-course'],
      learnerIds: ['lrn-1'],
    });

    expect(result).toBeDefined();
    expect(result.totalAssigned).toBe(1);

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
