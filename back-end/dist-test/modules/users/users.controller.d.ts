import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: string): Promise<import("../../database/schema").UserEntity[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateUserDto): Promise<import("../../database/schema").UserEntity>;
    update(id: string, dto: UpdateUserDto): Promise<import("../../database/schema").UserEntity>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
