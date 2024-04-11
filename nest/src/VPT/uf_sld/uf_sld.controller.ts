import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ValidationPipe,
  Delete,
  Inject,

} from '@nestjs/common';

import { UfSldService } from './uf_sld.service';

@Controller('uf-sld')
export class UfSldController{
  constructor(private readonly ufSldService: UfSldService) {}


  @Get()
  async getJson(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.ufSldService.getJson(
      query.applicationName,
      query.version,
      query.processFlow,
      query.tenant,
      query.appGroup,
      query.app,
    );
  }

  @Get('applicationName')
  async getApplicationName(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.ufSldService.getApplicationList(
      query.tenant,
      query.appGroup,
      query.app,
    );
  }

  @Get('propertyWindow')
  async propertyWindow(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.ufSldService.getpropertywindow(query.node);
  }

  @Get('flowName')
  async getFlowName(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.ufSldService.getFlowList(
      query.tenant,
      query.appGroup,
      query.app,
      query.applicationName,
    );
  }


  @Get('fabricsList')
  async fabricsList(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.ufSldService.getFabrics(
      query.tenant,
      query.appGroup,

    );
  }
  @Post()
  async saveJson(
    @Body() req: any,
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.ufSldService.saveaWorkFlow(
      req,
      query.type,
      query.version,
      query.tenant,
      query.appGroup,
      query.app,
    );
  }

  // @Get('/sync')
  // async syncToFolder(
  //   @Query(new ValidationPipe({ transform: true })) query: any,
  // ) {
  //   return this.ufSldService.syncToFolder(query.tenant);
  // }

  @Delete('/deleteApplication')
  async deleteApplication(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.ufSldService.deleteApplication(
      query.applicationName,
      query.tenant,
      query.appGroup,
      query.app,
    );
  }

  @Get('applicationDetails')
  async applicationDetails() {
    return this.ufSldService.applicationDetails();
  }

  @Get('/tenantDetails')
  async tenantDetails() {
    return this.ufSldService.tenantDetails();
  }


  @Get('/controlpolicy')
  async controlpolicy(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.ufSldService.controlpolicy(query.nodeType);
  }

  @Get('/userRole')
  async userRole(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.ufSldService.getUserRoleDetails(query.roleId);
  }

  // @Get('/redis')
  // async redisCheck(): Promise<any> {
  //   return await this.cacheManager.set('torus', {
  //     tenant: {
  //       application1: {
  //         pfflow: {
  //           v1: {
  //             data: '100',
  //           },
  //           v2: {
  //             data: '200',
  //           },
  //         },
  //       },
  //       application2: {
  //         pfflow: {
  //           v1: {
  //             data: '100',
  //           },
  //           v2: {
  //             data: '200',
  //           },
  //         },
  //       },
  //     },
  //   });
  //   // await this.cacheManager.get('sname')
  // }

  // @Get('/getredis')
  // async getredis(
  //   @Query(new ValidationPipe({ transform: true })) query: any,
  // ): Promise<any> {
  //   return await this.ufSldService.getRedis(query.tenant);
  // }

}
