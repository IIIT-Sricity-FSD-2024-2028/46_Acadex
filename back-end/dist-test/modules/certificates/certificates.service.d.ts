import { JsonRepository } from '../../database/json-repository';
export declare class CertificatesService {
    private readonly certificatesRepo;
    constructor(certificatesRepo: JsonRepository<any>);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    verify(credentialId: string): Promise<{
        verified: boolean;
        certificate: any;
        verificationTimestamp: string;
    }>;
    create(data: any): Promise<any>;
}
