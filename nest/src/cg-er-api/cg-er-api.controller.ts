import { Body, Controller, Post, Req } from '@nestjs/common';
import { erapiGenDto } from './Dto/apiGen.dto';
import { CG_APIService } from './cg-er-api.service';

@Controller('ERAPICodeGeneration')
export class CG_APIController {
    constructor(private readonly apiCodeGenerateService: CG_APIService) {}
    
    @Post()
    async createCode(@Body() body: erapiGenDto,@Req() request: Request): Promise<any> {
      const { key } = body;
      const headers = request.headers;
      const tenantName:string = headers['tenant'];
      const  appGroupName:string = headers['appgroup'];
      const  rkey:string = headers['rkey'];
      const rKeyParts:string[] = rkey.split(':');
      const appName:string = rKeyParts[2];
      return await this.apiCodeGenerateService.generateApi(key,tenantName,appGroupName,appName);
    }
}
