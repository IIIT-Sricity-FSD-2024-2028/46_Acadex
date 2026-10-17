import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS) private readonly learnersRepo: JsonRepository<any>
  ) {}

  private async enrich(cert: any) {
    const learner = cert.learnerId ? await this.learnersRepo.findById(cert.learnerId) : null;
    const learnerName = learner?.name || cert.learnerName || cert.learner || '';
    return { ...cert, learnerName, learner: learnerName,
      learnerEmail: learner?.email || cert.learnerEmail || '',
      courseTitle: cert.courseTitle || cert.course || '', course: cert.courseTitle || cert.course || '' };
  }

  async findAll() {
    return Promise.all((await this.certificatesRepo.find()).map(cert => this.enrich(cert)));
  }

  async findOne(id: string) {
    const cert = await this.certificatesRepo.findById(id) || await this.certificatesRepo.findOne({ credentialId: id });
    if (!cert) throw new NotFoundException(`Certificate '${id}' not found`);
    return this.enrich(cert);
  }

  async verify(credentialId: string) {
    const cert = await this.certificatesRepo.findOne({ credentialId }) || await this.certificatesRepo.findById(credentialId);
    if (!cert) {
      throw new NotFoundException(`Credential ID '${credentialId}' not found on public ledger`);
    }
    return {
      verified: true,
      certificate: await this.enrich(cert),
      verificationTimestamp: new Date().toISOString(),
    };
  }

  async create(data: any) {
    return this.certificatesRepo.create({
      id: `cert-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      status: 'Verified',
      ...data,
    });
  }
}
