import { OrganizationService } from './organization.service';
export declare class OrganizationsController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    verify(id: string, body: any): Promise<any>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
