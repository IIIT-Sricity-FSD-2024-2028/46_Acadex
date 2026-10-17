import { Body, Controller, Get, Param, Patch, Post, Delete, Req } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspace:WorkspaceService) {}
  @Get('session') async session(@Req() req:any){return this.workspace.identity(req.headers);}
  @Get('overview') async overview(@Req() req:any){return this.workspace.overview(await this.workspace.identity(req.headers));}
  @Get('notifications') async inbox(@Req() req:any){return this.workspace.inbox(await this.workspace.identity(req.headers));}
  @Patch('notifications/read-all') async readAll(@Req() req:any){return this.workspace.mark(await this.workspace.identity(req.headers));}
  @Patch('notifications/:id/read') async read(@Req() req:any,@Param('id') id:string){return this.workspace.mark(await this.workspace.identity(req.headers),id);}
  @Delete('notifications/:id') async dismiss(@Req() req:any,@Param('id') id:string){return this.workspace.dismiss(await this.workspace.identity(req.headers),id);}
}
