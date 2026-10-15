import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    verify(credentialId: string): Promise<{
        verified: boolean;
        certificate: any;
        verificationTimestamp: string;
    }>;
    create(body: any): Promise<any>;
}
