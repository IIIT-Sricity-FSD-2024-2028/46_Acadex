import { OnModuleInit } from '@nestjs/common';
import { BaseEntity } from './interfaces/database.interface';
export declare class JsonDatabaseService implements OnModuleInit {
    private readonly logger;
    private readonly dataDir;
    private readonly memoryStore;
    private readonly fileLocks;
    private transactionLock;
    private readonly defaultSeedMap;
    constructor();
    onModuleInit(): Promise<void>;
    private ensureDataDirectory;
    private initializeCollections;
    getCollectionFilePath(collection: string): string;
    getCollection<T extends BaseEntity>(collection: string): Promise<T[]>;
    setCollection<T extends BaseEntity>(collection: string, items: T[]): Promise<void>;
    getInMemoryData<T extends BaseEntity>(collection: string): T[];
    setInMemoryData<T extends BaseEntity>(collection: string, data: T[]): void;
    writeCollectionAtomic<T extends BaseEntity>(collection: string, data: T[]): Promise<void>;
    runTransaction<R>(action: (db?: JsonDatabaseService) => Promise<R>): Promise<R>;
    exportDatabaseSnapshot(): Promise<Record<string, any[]>>;
    importDatabaseSnapshot(snapshot: Record<string, any[]>): Promise<void>;
    resetCollection(collection: string): Promise<BaseEntity[]>;
    resetAllCollections(): Promise<void>;
    getCollectionsStats(): Record<string, number>;
}
