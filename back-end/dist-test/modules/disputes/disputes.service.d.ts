import { JsonRepository } from '../../database/json-repository';
import { CreateDisputeDto, DisputeQueryDto, ResolveDisputeDto, UpdateDisputeStatusDto } from './dto/dispute.dto';
export declare class DisputesService {
    private readonly disputesRepo;
    private readonly notifsRepo;
    constructor(disputesRepo: JsonRepository<any>, notifsRepo: JsonRepository<any>);
    findAll(query: DisputeQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateDisputeDto): Promise<any>;
    updateStatus(id: string, dto: UpdateDisputeStatusDto): Promise<any>;
    resolve(id: string, dto: ResolveDisputeDto): Promise<any>;
    delete(id: string): Promise<boolean>;
}
