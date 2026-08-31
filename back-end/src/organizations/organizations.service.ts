import { Injectable, NotFoundException } from '@nestjs/common';
import { organizations } from '../data';

@Injectable()
export class OrganizationsService {
  private organizationsList = [...organizations];

  findAll() {
    return this.organizationsList;
  }

  findOne(id: number) {
    const org = this.organizationsList.find((o) => o.id === id);
    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return org;
  }

  create(dto: any) {
    const newOrg = { id: Date.now(), ...dto };
    this.organizationsList.push(newOrg);
    return newOrg;
  }

  update(id: number, dto: any) {
    const org = this.findOne(id);
    const updated = { ...org, ...dto };
    this.organizationsList = this.organizationsList.map((o) => (o.id === id ? updated : o));
    return updated;
  }

  remove(id: number) {
    this.findOne(id);
    this.organizationsList = this.organizationsList.filter((o) => o.id !== id);
    return { success: true };
  }
}
