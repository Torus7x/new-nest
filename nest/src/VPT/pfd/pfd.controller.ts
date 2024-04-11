import { Body, Controller, Get, Param, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { PfdService } from './pfd.service';

@Controller('pfd')
export class PfdController {
  constructor(private readonly vptPfdService: PfdService) { }
  @Get('version-list')
  async fabricVersionList(): Promise<any> {
    return await this.vptPfdService.getFabricVersionList();
  }

  @Get('version/:version')
  async fabricVersion(
    @Param('version') version: any
  ): Promise<any> {
    return await this.vptPfdService.getFabricVersion(version);
  }

  @Put('update-version')
  async updateFabric(
    @Body() req: any,
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.vptPfdService.updateFabric(req, query.version);
  }

  @Post('save-new-version')
  async saveFabric(
    @Body() req: any,
  ): Promise<any> {
    return await this.vptPfdService.saveFabric(req.key, req.value);
  }
}

