import { InstructorRequestsService } from './instructor-requests.service';
import { CreateJoinRequestDto, CreateTeachingRequestDto, DecideJoinRequestDto, InstructorRequestQueryDto, RespondTeachingRequestDto, WithdrawTeachingRequestDto } from './dto/instructor-request.dto';
export declare class InstructorRequestsController {
    private readonly requestsService;
    constructor(requestsService: InstructorRequestsService);
    findAll(query: InstructorRequestQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    myJoinRequests(userId: string): Promise<any[]>;
    createJoinRequest(userId: string, dto: CreateJoinRequestDto): Promise<any>;
    orgJoinRequests(userEmail: string): Promise<any[]>;
    cancelJoinRequest(userId: string, id: string): Promise<any>;
    decideJoinRequest(userEmail: string, id: string, dto: DecideJoinRequestDto): Promise<any>;
    findOne(id: string): Promise<any>;
    create(dto: CreateTeachingRequestDto): Promise<any>;
    respond(id: string, dto: RespondTeachingRequestDto): Promise<any>;
    withdraw(id: string, dto: WithdrawTeachingRequestDto): Promise<any>;
    resend(id: string): Promise<any>;
    delete(id: string): Promise<boolean>;
}
