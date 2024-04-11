
import { Body, Controller, Get, Param, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { DfdService } from './dfd.service';


@Controller('dfd')
export class DfdController {
  constructor(private readonly VptErdService: DfdService) { }
  @Get('version-list')
  async fabricVersionList(): Promise<any> {
    return await this.VptErdService.getFabricVersionList();
  }

  @Get('version/:version')
  async fabricVersion(
    @Param('version') version: any
  ): Promise<any> {
    return await this.VptErdService.getFabricVersion(version);
  }

  @Put('update-version')
  async updateFabric(
    @Body() req: any,
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.VptErdService.updateFabric(req, query.version);
  }

  @Post('save-new-version')
  async saveFabric(
    @Body() req: any,
  ): Promise<any> {
    return await this.VptErdService.saveFabric(req.key, req.value);
  }
}
