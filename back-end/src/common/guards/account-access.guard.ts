import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class AccountAccessGuard implements CanActivate {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERS) private readonly users: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS) private readonly learners: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS) private readonly instructors: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATIONS) private readonly organizations: JsonRepository<any>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const path = request.path || request.url || '';
    // Sign-in and public credential verification must remain reachable.
    if (/\/auth\//.test(path) || /\/certificates\/verify\//.test(path)) return true;
    const token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return true;
    const id = request.headers['x-user-id'] || token.match(/^jwt-token-(.+)-\d+$/)?.[1];
    if (!id) return true;
    const records = await Promise.all([
      this.users.findById(id), this.learners.findById(id),
      this.instructors.findById(id), this.organizations.findById(id),
    ]);
    const account = records.find(Boolean);
    if (!account) throw new UnauthorizedException('This account no longer exists. Please sign in again.');
    if (account.status === 'Suspended') throw new ForbiddenException('This account is suspended.');
    return true;
  }
}
