import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Notifications')
@ApiSecurity('x-role')
@Roles('admin', 'learner', 'instructor', 'organization')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new notification' })
  create(@Body() body: any) {
    return this.notificationsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification status' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.notificationsService.update(+id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
