import { JsonRepository } from '../../database/json-repository';
import { CreateJoinRequestDto, CreateTeachingRequestDto, DecideJoinRequestDto, InstructorRequestQueryDto, RespondTeachingRequestDto, WithdrawTeachingRequestDto } from './dto/instructor-request.dto';
export declare const JOIN_STATUS: {
    PENDING: string;
    APPROVED: string;
    REJECTED: string;
    CANCELLED: string;
};
export declare class InstructorRequestsService {
    private readonly requestsRepo;
    private readonly instructorsRepo;
    private readonly coursesRepo;
    private readonly notifsRepo;
    private readonly orgsRepo;
    private readonly usersRepo;
    constructor(requestsRepo: JsonRepository<any>, instructorsRepo: JsonRepository<any>, coursesRepo: JsonRepository<any>, notifsRepo: JsonRepository<any>, orgsRepo: JsonRepository<any>, usersRepo: JsonRepository<any>);
    private instructorForUser;
    private orgForAdmin;
    private isAffiliated;
    private affiliate;
    findAll(query: InstructorRequestQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateTeachingRequestDto): Promise<any>;
    respond(id: string, dto: RespondTeachingRequestDto): Promise<any>;
    withdraw(id: string, dto: WithdrawTeachingRequestDto): Promise<any>;
    resend(id: string): Promise<any>;
    delete(id: string): Promise<boolean>;
    myJoinRequests(userId?: string): Promise<any[]>;
    createJoinRequest(userId: string, dto: CreateJoinRequestDto): Promise<any>;
    cancelJoinRequest(userId: string, id: string): Promise<any>;
    orgJoinRequests(userEmail?: string): Promise<any[]>;
    decideJoinRequest(userEmail: string, id: string, dto: DecideJoinRequestDto): Promise<any>;
}
