import { Body, Controller, Get, Param, Patch, Post, Delete, Req } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspace:WorkspaceService) {}
  @Get('instructor') async instructor(@Req() req:any){return this.workspace.instructorWorkspace(await this.workspace.identity(req.headers));}
  @Get('instructor/learners/:id') async learner(@Req() req:any,@Param('id') id:string){return this.workspace.instructorLearner(await this.workspace.identity(req.headers),id);}
  @Get('instructor/reviews') async reviews(@Req() req:any){return this.workspace.instructorReviews(await this.workspace.identity(req.headers));}
  @Post('instructor/reviews/:id/reply') async reply(@Req() req:any,@Param('id') id:string,@Body() body:any){return this.workspace.instructorReply(await this.workspace.identity(req.headers),id,body);}
  @Delete('instructor/reviews/:id/reply') async removeReply(@Req() req:any,@Param('id') id:string){return this.workspace.instructorReply(await this.workspace.identity(req.headers),id,null,true);}
  @Get('account') async account(@Req() req:any){return this.workspace.accountProfile(await this.workspace.identity(req.headers));}
  @Patch('account') async updateAccount(@Req() req:any,@Body() body:any){return this.workspace.updateAccountProfile(await this.workspace.identity(req.headers),body);}
  @Get('session') async session(@Req() req:any){return this.workspace.identity(req.headers);}
  @Get('overview') async overview(@Req() req:any){return this.workspace.overview(await this.workspace.identity(req.headers));}
  @Get('notifications') async inbox(@Req() req:any){return this.workspace.inbox(await this.workspace.identity(req.headers));}
  @Patch('notifications/read-all') async readAll(@Req() req:any){return this.workspace.mark(await this.workspace.identity(req.headers));}
  @Patch('notifications/:id/read') async read(@Req() req:any,@Param('id') id:string){return this.workspace.mark(await this.workspace.identity(req.headers),id);}
  @Delete('notifications/:id') async dismiss(@Req() req:any,@Param('id') id:string){return this.workspace.dismiss(await this.workspace.identity(req.headers),id);}
}
