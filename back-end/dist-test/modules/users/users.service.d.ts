import { JsonRepository } from '../../database/json-repository';
import { UserEntity } from '../../database/schema';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
export declare class UsersService {
    private readonly usersRepo;
    private readonly learnersRepo;
    private readonly instructorsRepo;
    constructor(usersRepo: JsonRepository<UserEntity>, learnersRepo: JsonRepository<any>, instructorsRepo: JsonRepository<any>);
    findAll(role?: string): Promise<UserEntity[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateUserDto): Promise<UserEntity>;
    update(id: string, dto: UpdateUserDto): Promise<UserEntity>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
