import {CanActivate,ExecutionContext,Injectable} from '@nestjs/common';
import {WorkspaceService} from '../platform/workspace.service';
import {CourseWorkflowService} from './course-workflow.service';
@Injectable()
export class CourseMediaGuard implements CanActivate{
 constructor(private readonly workspace:WorkspaceService,private readonly workflow:CourseWorkflowService){}
 async canActivate(context:ExecutionContext){const req=context.switchToHttp().getRequest();const actor=await this.workspace.identity(req.headers);const course=await this.workflow.course(req.params.id);if(actor.canonicalRole==='instructor')this.workflow.assertInstructor(actor,course);else this.workflow.assertOrganization(actor,course);return true;}
}
