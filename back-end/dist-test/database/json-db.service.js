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
var JsonDatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDatabaseService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const initial_data_1 = require("./seeds/initial-data");
let JsonDatabaseService = JsonDatabaseService_1 = class JsonDatabaseService {
    constructor() {
        this.logger = new common_1.Logger(JsonDatabaseService_1.name);
        this.memoryStore = new Map();
        this.fileLocks = new Map();
        this.transactionLock = Promise.resolve();
        this.defaultSeedMap = {
            users: initial_data_1.initialUsersData,
            organizations: initial_data_1.initialOrganizationData,
            universities: initial_data_1.initialUniversitiesData,
            instructors: initial_data_1.initialInstructorsData,
            instructor_requests: initial_data_1.initialInstructorRequestsData,
            learners: initial_data_1.initialLearnersData,
            students: initial_data_1.initialStudentsData,
            courses: initial_data_1.initialCoursesData,
            enrollments: initial_data_1.initialEnrollmentsData,
            quizzes: initial_data_1.initialQuizzesData,
            quiz_questions: initial_data_1.initialQuizQuestionsData,
            assignments: initial_data_1.initialAssignmentsData,
            submissions: initial_data_1.initialSubmissionsData,
            certificates: initial_data_1.initialCertificatesData,
            transactions: initial_data_1.initialTransactionsData,
            refunds: initial_data_1.initialRefundsData,
            reviews: initial_data_1.initialReviewsData,
            disputes: initial_data_1.initialDisputesData,
            reports: initial_data_1.initialReportsData,
            notifications: initial_data_1.initialNotificationsData,
            settings: initial_data_1.initialSettingsData,
        };
        if (process.env.DATA_DIR) {
            this.dataDir = path.resolve(process.cwd(), process.env.DATA_DIR);
        }
        else {
            const cwdData = path.resolve(process.cwd(), 'data');
            const relData = path.resolve(__dirname, '../../data');
            if (fs.existsSync(cwdData)) {
                this.dataDir = cwdData;
            }
            else if (fs.existsSync(relData)) {
                this.dataDir = relData;
            }
            else {
                this.dataDir = cwdData;
            }
        }
    }
    async onModuleInit() {
        this.ensureDataDirectory();
        await this.initializeCollections();
    }
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            this.logger.log(`Initialized JSON database directory at: ${this.dataDir}`);
        }
    }
    async initializeCollections() {
        for (const [collection, seedData] of Object.entries(this.defaultSeedMap)) {
            const filePath = this.getCollectionFilePath(collection);
            let data = [];
            if (fs.existsSync(filePath)) {
                try {
                    const raw = await fs.promises.readFile(filePath, 'utf-8');
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        data = parsed;
                        this.logger.log(`Loaded ${data.length} records for collection: '${collection}' from JSON file`);
                    }
                    else {
                        data = seedData;
                        await this.writeCollectionAtomic(collection, data);
                        this.logger.log(`Seeded ${data.length} default records for collection: '${collection}'`);
                    }
                }
                catch (error) {
                    this.logger.warn(`Failed reading '${collection}.json', seeding default dataset: ${error.message}`);
                    data = seedData;
                    await this.writeCollectionAtomic(collection, data);
                }
            }
            else {
                data = seedData;
                await this.writeCollectionAtomic(collection, data);
                this.logger.log(`Created and seeded '${collection}.json' with ${data.length} records`);
            }
            this.memoryStore.set(collection, JSON.parse(JSON.stringify(data)));
        }
    }
    getCollectionFilePath(collection) {
        return path.join(this.dataDir, `${collection}.json`);
    }
    async getCollection(collection) {
        const filePath = this.getCollectionFilePath(collection);
        if (fs.existsSync(filePath)) {
            try {
                const raw = await fs.promises.readFile(filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    this.memoryStore.set(collection, parsed);
                    return JSON.parse(JSON.stringify(parsed));
                }
            }
            catch {
            }
        }
        if (!this.memoryStore.has(collection)) {
            const defaultData = this.defaultSeedMap[collection] || [];
            this.memoryStore.set(collection, JSON.parse(JSON.stringify(defaultData)));
        }
        return JSON.parse(JSON.stringify(this.memoryStore.get(collection)));
    }
    async setCollection(collection, items) {
        await this.writeCollectionAtomic(collection, items);
    }
    getInMemoryData(collection) {
        if (!this.memoryStore.has(collection)) {
            const defaultData = this.defaultSeedMap[collection] || [];
            this.memoryStore.set(collection, JSON.parse(JSON.stringify(defaultData)));
        }
        return this.memoryStore.get(collection);
    }
    setInMemoryData(collection, data) {
        this.memoryStore.set(collection, data);
    }
    async writeCollectionAtomic(collection, data) {
        this.ensureDataDirectory();
        this.setInMemoryData(collection, data);
        const filePath = this.getCollectionFilePath(collection);
        const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
        const currentLock = this.fileLocks.get(collection) || Promise.resolve();
        const writeOp = currentLock.then(async () => {
            try {
                const serialized = JSON.stringify(data, null, 2);
                await fs.promises.writeFile(tempPath, serialized, 'utf-8');
                await fs.promises.rename(tempPath, filePath);
            }
            catch (err) {
                if (fs.existsSync(tempPath)) {
                    try {
                        await fs.promises.unlink(tempPath);
                    }
                    catch {
                    }
                }
                this.logger.error(`Atomic write failure on collection '${collection}': ${err.message}`, err.stack);
                throw err;
            }
        });
        this.fileLocks.set(collection, writeOp);
        return writeOp;
    }
    async runTransaction(action) {
        const prevLock = this.transactionLock;
        let resolveLock;
        this.transactionLock = new Promise((resolve) => {
            resolveLock = resolve;
        });
        await prevLock;
        try {
            const result = await action(this);
            return result;
        }
        finally {
            resolveLock();
        }
    }
    async exportDatabaseSnapshot() {
        const snapshot = {};
        for (const collection of Object.keys(this.defaultSeedMap)) {
            snapshot[collection] = await this.getCollection(collection);
        }
        return snapshot;
    }
    async importDatabaseSnapshot(snapshot) {
        for (const [collection, data] of Object.entries(snapshot)) {
            if (Array.isArray(data)) {
                await this.setCollection(collection, data);
            }
        }
        this.logger.log(`Imported database snapshot containing ${Object.keys(snapshot).length} collections.`);
    }
    async resetCollection(collection) {
        const seed = this.defaultSeedMap[collection] || [];
        const fresh = JSON.parse(JSON.stringify(seed));
        await this.writeCollectionAtomic(collection, fresh);
        this.logger.log(`Collection '${collection}' reset to factory initial state.`);
        return fresh;
    }
    async resetAllCollections() {
        for (const collection of Object.keys(this.defaultSeedMap)) {
            await this.resetCollection(collection);
        }
        this.logger.log(`All ${Object.keys(this.defaultSeedMap).length} database collections reset to factory initial state.`);
    }
    getCollectionsStats() {
        const stats = {};
        for (const collection of Object.keys(this.defaultSeedMap)) {
            const records = this.getInMemoryData(collection);
            stats[collection] = records.length;
        }
        return stats;
    }
};
exports.JsonDatabaseService = JsonDatabaseService;
exports.JsonDatabaseService = JsonDatabaseService = JsonDatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JsonDatabaseService);
//# sourceMappingURL=json-db.service.js.map