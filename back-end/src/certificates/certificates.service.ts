import { Injectable, NotFoundException } from '@nestjs/common';
import { certificates } from '../data';

@Injectable()
export class CertificatesService {
  private certsList = [...certificates];

  findAll() {
    return this.certsList;
  }

  findOne(id: string) {
    const cert = this.certsList.find((c) => c.id === id);
    if (!cert) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return cert;
  }

  create(dto: any) {
    const newCert = { id: `CERT-${Date.now()}`, ...dto };
    this.certsList.push(newCert);
    return newCert;
  }

  update(id: string, dto: any) {
    const cert = this.findOne(id);
    const updated = { ...cert, ...dto };
    this.certsList = this.certsList.map((c) => (c.id === id ? updated : c));
    return updated;
  }

  remove(id: string) {
    this.findOne(id);
    this.certsList = this.certsList.filter((c) => c.id !== id);
    return { success: true };
  }
}
