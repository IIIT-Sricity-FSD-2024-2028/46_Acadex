import { AuthModule } from '../auth/auth.module';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PlatformService } from './platform.service';
import { AdminController, AdminAccountGuard, PublicController } from './platform.controller';
@Module({ imports: [UsersModule, AuthModule], controllers: [AdminController, PublicController, WorkspaceController], providers: [PlatformService, AdminAccountGuard, WorkspaceService] })
export class PlatformModule {
}
