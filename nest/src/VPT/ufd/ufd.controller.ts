import { Controller } from '@nestjs/common';
import { Body, Get, Param, Post, Put, Query, ValidationPipe } from '@nestjs/common';

import { UfdService } from './ufd.service';


@Controller('ufd')
export class UfdController  {
  constructor(private readonly vptUfdService: UfdService) { }
  @Get('version-list')
  async fabricVersionList(): Promise<any> {
    return await this.vptUfdService.getFabricVersionList();
  }

  @Get('version/:version')
  async fabricVersion(
    @Param('version') version: any
  ): Promise<any> {
    return await this.vptUfdService.getFabricVersion(version);
  }

  @Put('update-version')
  async updateFabric(
    @Body() req: any,
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.vptUfdService.updateFabric(req, query.version);
  }

  @Post('save-new-version')
  async saveFabric(
    @Body() req: any,
  ): Promise<any> {
    return await this.vptUfdService.saveFabric(req.key, req.value);
  }
}
