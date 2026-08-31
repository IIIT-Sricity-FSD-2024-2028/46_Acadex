import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';

@ApiTags('Certificates')
@ApiSecurity('x-role')
@Roles('admin', 'learner', 'instructor')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all certificates' })
  findAll() {
    return this.certificatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Issue a new certificate' })
  create(@Body() body: any) {
    return this.certificatesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update certificate status' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.certificatesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke certificate' })
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }
}
