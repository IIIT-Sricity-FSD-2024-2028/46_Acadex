import { JsonRepository } from '../../database/json-repository';
export declare class RefundsService {
    private readonly refundsRepo;
    private readonly transactionsRepo;
    constructor(refundsRepo: JsonRepository<any>, transactionsRepo: JsonRepository<any>);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
}
