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
import { PfPfdService } from './pf_pfd.service';

@Controller('pf-pfd')
export class PfPfdController {
  constructor(private readonly pfPfdService: PfPfdService) {}

  getHello(): string {
    return 'Hello World!';
  }

  @Get()
  async getJson(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.pfPfdService.getJson(
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
    return await this.pfPfdService.getApplicationList(
      query.tenant,
      query.appGroup,
      query.app,
    );
  }

  @Get('flowName')
  async getFlowName(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.pfPfdService.getFlowList(
      query.tenant,
      query.appGroup,
      query.app,
      query.applicationName,
    );
  }

  @Get('appGroup')
  async appGroup(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.pfPfdService.getappGroup(query.tenant);
  }

  // @Get('app')
  // async getapplications(
  //   @Query(new ValidationPipe({ transform: true })) query: any,
  // ): Promise<any> {
  //   return await this.pfPfdService.getapplications(
  //     query.tenant,
  //     query.appGroup,
  //     query.app,
  //   );
  // }

  @Get('fabricsList')
  async fabricsList(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.pfPfdService.getFabrics(query.tenant, query.appGroup);
  }
  @Post()
  async saveJson(
    @Body() req: any,
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return await this.pfPfdService.saveaWorkFlow(
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
  //   return this.pfPfdService.syncToFolder(query.tenant);
  // }

  @Delete('/deleteApplication')
  async deleteApplication(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.pfPfdService.deleteApplication(
      query.applicationName,
      query.tenant,
      query.appGroup,
      query.app,
    );
  }

  @Get('applicationDetails')
  async applicationDetails() {
    return this.pfPfdService.applicationDetails();
  }

  @Get('/tenantDetails')
  async tenantDetails() {
    return this.pfPfdService.tenantDetails();
  }

  @Get('/controlpolicy')
  async controlpolicy(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.pfPfdService.controlpolicy(query.nodeType);
  }

  @Get('propertyWindow')
  async propertyWindow(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.pfPfdService.getpropertywindow(query.node);
  }

  @Get('/userRole')
  async userRole(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<any> {
    return this.pfPfdService.getUserRoleDetails(query.roleId);
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
  //   return await this.pfPfdService.getRedis(query.tenant);
  // }

  // @Get('/delredis')
  // async delredis(): Promise<any> {
  //   return await this.cacheManager.del('torus');
  // }
}
