import { BaseEntity, FindOptions, IJsonRepository, PaginatedResult, QueryFilter } from './interfaces/database.interface';
import { JsonDatabaseService } from './json-db.service';
export declare class JsonRepository<T extends BaseEntity> implements IJsonRepository<T> {
    private readonly collectionName;
    private readonly dbService;
    constructor(collectionName: string, dbService: JsonDatabaseService);
    getCollectionName(): string;
    find(options?: FindOptions<T>): Promise<T[]>;
    findAndCount(options?: FindOptions<T>): Promise<PaginatedResult<T>>;
    findOne(where: QueryFilter<T>): Promise<T | null>;
    findById(id: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    createMany(dataList: Partial<T>[]): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    updateMany(where: QueryFilter<T>, data: Partial<T>): Promise<number>;
    delete(id: string): Promise<boolean>;
    deleteMany(where: QueryFilter<T>): Promise<number>;
    count(where?: QueryFilter<T>): Promise<number>;
    private matchFilter;
    private applySorting;
}
