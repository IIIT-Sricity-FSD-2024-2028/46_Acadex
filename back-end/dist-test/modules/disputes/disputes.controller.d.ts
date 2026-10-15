import { DisputesService } from './disputes.service';
import { CreateDisputeDto, DisputeQueryDto, ResolveDisputeDto, UpdateDisputeStatusDto } from './dto/dispute.dto';
export declare class DisputesController {
    private readonly disputesService;
    constructor(disputesService: DisputesService);
    findAll(query: DisputeQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateDisputeDto): Promise<any>;
    updateStatus(id: string, dto: UpdateDisputeStatusDto): Promise<any>;
    resolve(id: string, dto: ResolveDisputeDto): Promise<any>;
    delete(id: string): Promise<boolean>;
}
