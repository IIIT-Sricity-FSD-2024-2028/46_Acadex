import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  initialUsersData,
  initialOrganizationData,
  initialUniversitiesData,
  initialInstructorsData,
  initialInstructorRequestsData,
  initialLearnersData,
  initialStudentsData,
  initialCoursesData,
  initialEnrollmentsData,
  initialQuizzesData,
  initialQuizQuestionsData,
  initialAssignmentsData,
  initialSubmissionsData,
  initialCertificatesData,
  initialTransactionsData,
  initialRefundsData,
  initialReviewsData,
  initialDisputesData,
  initialReportsData,
  initialNotificationsData,
  initialSettingsData,
} from './seeds/initial-data';
import { BaseEntity } from './interfaces/database.interface';

@Injectable()
export class JsonDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(JsonDatabaseService.name);
  private readonly dataDir: string;
  private readonly memoryStore = new Map<string, BaseEntity[]>();
  private readonly fileLocks = new Map<string, Promise<void>>();
  private transactionLock: Promise<any> = Promise.resolve();

  // Default collections and initial seed data mapping
  private readonly defaultSeedMap: Record<string, any[]> = {
    users: initialUsersData,
    organizations: initialOrganizationData,
    universities: initialUniversitiesData,
    instructors: initialInstructorsData,
    instructor_requests: initialInstructorRequestsData,
    learners: initialLearnersData,
    students: initialStudentsData,
    courses: initialCoursesData,
    enrollments: initialEnrollmentsData,
    quizzes: initialQuizzesData,
    quiz_questions: initialQuizQuestionsData,
    assignments: initialAssignmentsData,
    submissions: initialSubmissionsData,
    certificates: initialCertificatesData,
    transactions: initialTransactionsData,
    refunds: initialRefundsData,
    reviews: initialReviewsData,
    disputes: initialDisputesData,
    reports: initialReportsData,
    notifications: initialNotificationsData,
    settings: initialSettingsData,
  };

  constructor() {
    if (process.env.DATA_DIR) {
      this.dataDir = path.resolve(process.cwd(), process.env.DATA_DIR);
    } else {
      const cwdData = path.resolve(process.cwd(), 'data');
      const relData = path.resolve(__dirname, '../../data');
      if (fs.existsSync(cwdData)) {
        this.dataDir = cwdData;
      } else if (fs.existsSync(relData)) {
        this.dataDir = relData;
      } else {
        this.dataDir = cwdData;
      }
    }
  }

  async onModuleInit() {
    this.ensureDataDirectory();
    await this.initializeCollections();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      this.logger.log(`Initialized JSON database directory at: ${this.dataDir}`);
    } else {
      try {
        const files = fs.readdirSync(this.dataDir);
        for (const file of files) {
          if (file.endsWith('.tmp') || file.includes('.tmp.')) {
            try {
              fs.unlinkSync(path.join(this.dataDir, file));
            } catch {}
          }
        }
      } catch {}
    }
  }

  private async initializeCollections() {
    for (const [collection, seedData] of Object.entries(this.defaultSeedMap)) {
      const filePath = this.getCollectionFilePath(collection);
      let data: BaseEntity[] = [];

      if (fs.existsSync(filePath)) {
        try {
          const raw = await fs.promises.readFile(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            data = parsed;
            this.logger.log(`Loaded ${data.length} records for collection: '${collection}' from JSON file`);
          } else {
            data = seedData;
            await this.writeCollectionAtomic(collection, data);
            this.logger.log(`Seeded ${data.length} default records for collection: '${collection}'`);
          }
        } catch (error) {
          this.logger.warn(`Failed reading '${collection}.json', seeding default dataset: ${error.message}`);
          data = seedData;
          await this.writeCollectionAtomic(collection, data);
        }
      } else {
        data = seedData;
        await this.writeCollectionAtomic(collection, data);
        this.logger.log(`Created and seeded '${collection}.json' with ${data.length} records`);
      }

      this.memoryStore.set(collection, JSON.parse(JSON.stringify(data)));
    }
  }

  public getCollectionFilePath(collection: string): string {
    return path.join(this.dataDir, `${collection}.json`);
  }

  public async getCollection<T extends BaseEntity>(collection: string): Promise<T[]> {
    const filePath = this.getCollectionFilePath(collection);
    if (fs.existsSync(filePath)) {
      try {
        const raw = await fs.promises.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.memoryStore.set(collection, parsed);
          return JSON.parse(JSON.stringify(parsed)) as T[];
        }
      } catch {
        // Fall back to in-memory store if disk read fails
      }
    }

    if (!this.memoryStore.has(collection)) {
      const defaultData = this.defaultSeedMap[collection] || [];
      this.memoryStore.set(collection, JSON.parse(JSON.stringify(defaultData)));
    }
    return JSON.parse(JSON.stringify(this.memoryStore.get(collection))) as T[];
  }

  public async setCollection<T extends BaseEntity>(collection: string, items: T[]): Promise<void> {
    await this.writeCollectionAtomic(collection, items);
  }

  public getInMemoryData<T extends BaseEntity>(collection: string): T[] {
    if (!this.memoryStore.has(collection)) {
      const defaultData = this.defaultSeedMap[collection] || [];
      this.memoryStore.set(collection, JSON.parse(JSON.stringify(defaultData)));
    }
    return this.memoryStore.get(collection) as T[];
  }

  public setInMemoryData<T extends BaseEntity>(collection: string, data: T[]): void {
    this.memoryStore.set(collection, data);
  }

  public async writeCollectionAtomic<T extends BaseEntity>(
    collection: string,
    data: T[]
  ): Promise<void> {
    this.ensureDataDirectory();
    this.setInMemoryData(collection, data);

    const filePath = this.getCollectionFilePath(collection);
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    const tempPath = path.join(dir, `.${base}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`);

    // Ensure previous lock completion without propagating prior errors to subsequent operations
    const currentLock = this.fileLocks.get(collection) || Promise.resolve();
    const waitLock = currentLock.catch(() => {});

    const writeOp = waitLock.then(async () => {
      const serialized = JSON.stringify(data, null, 2);
      try {
        await fs.promises.writeFile(tempPath, serialized, 'utf-8');

        // On Windows and OneDrive sync folders, renaming over an existing file can throw EPERM/EACCES/EBUSY
        // if another process (such as a concurrent read or cloud-sync filter) momentarily holds a handle.
        let replaced = false;
        let lastError: any = null;

        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            await fs.promises.rename(tempPath, filePath);
            replaced = true;
            break;
          } catch (err: any) {
            lastError = err;
            if ((err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY') && attempt < 4) {
              await new Promise((resolve) => setTimeout(resolve, 25 * Math.pow(2, attempt)));
            } else {
              break;
            }
          }
        }

        // If rename failed (e.g. Windows file lock preventing DELETE access),
        // fallback to copyFile which only requires GENERIC_WRITE permission.
        if (!replaced) {
          try {
            await fs.promises.copyFile(tempPath, filePath);
            replaced = true;
          } catch (copyErr) {
            // Direct file write fallback as final safeguard
            await fs.promises.writeFile(filePath, serialized, 'utf-8');
            replaced = true;
          }
        }
      } catch (err: any) {
        this.logger.error(`Atomic write failure on collection '${collection}': ${err.message}`, err.stack);
        throw err;
      } finally {
        if (fs.existsSync(tempPath)) {
          try {
            await fs.promises.unlink(tempPath);
          } catch {
            // ignore temp file cleanup error
          }
        }
      }
    });

    this.fileLocks.set(collection, writeOp);
    return writeOp;
  }

  public async runTransaction<R>(action: (db?: JsonDatabaseService) => Promise<R>): Promise<R> {
    const prevLock = this.transactionLock;
    let resolveLock: () => void;
    this.transactionLock = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    await prevLock;
    const snapshot = new Map<string, any[]>();
    try {
      const files = await fs.promises.readdir(this.dataDir);
      for (const file of files.filter(file => file.endsWith('.json'))) {
        const name = file.slice(0, -5);
        snapshot.set(name, await this.getCollection(name));
      }
      try {
        return await action(this);
      } catch (error) {
        for (const [name, rows] of snapshot) await this.setCollection(name, rows);
        const currentFiles = await fs.promises.readdir(this.dataDir);
        for (const file of currentFiles.filter(file => file.endsWith('.json') && !snapshot.has(file.slice(0, -5)))) {
          await fs.promises.unlink(path.join(this.dataDir, file));
          this.memoryStore.delete(file.slice(0, -5));
        }
        throw error;
      }
    } finally {
      resolveLock!();
    }
  }

  public async exportDatabaseSnapshot(): Promise<Record<string, any[]>> {
    const snapshot: Record<string, any[]> = {};
    for (const collection of Object.keys(this.defaultSeedMap)) {
      snapshot[collection] = await this.getCollection(collection);
    }
    return snapshot;
  }

  public async importDatabaseSnapshot(snapshot: Record<string, any[]>): Promise<void> {
    for (const [collection, data] of Object.entries(snapshot)) {
      if (Array.isArray(data)) {
        await this.setCollection(collection, data);
      }
    }
    this.logger.log(`Imported database snapshot containing ${Object.keys(snapshot).length} collections.`);
  }

  public async resetCollection(collection: string): Promise<BaseEntity[]> {
    const seed = this.defaultSeedMap[collection] || [];
    const fresh = JSON.parse(JSON.stringify(seed));
    await this.writeCollectionAtomic(collection, fresh);
    this.logger.log(`Collection '${collection}' reset to factory initial state.`);
    return fresh;
  }

  public async resetAllCollections(): Promise<void> {
    for (const collection of Object.keys(this.defaultSeedMap)) {
      await this.resetCollection(collection);
    }
    this.logger.log(`All ${Object.keys(this.defaultSeedMap).length} database collections reset to factory initial state.`);
  }

  public getCollectionsStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const collection of Object.keys(this.defaultSeedMap)) {
      const records = this.getInMemoryData(collection);
      stats[collection] = records.length;
    }
    return stats;
  }
}
