import { Body, Controller, Post } from '@nestjs/common';
import { apiGenDto } from './Dto/apiGen.dto';
import { CG_APIService } from './cg-api.service';

@Controller('APICodeGeneration')
export class CG_APIController {
    constructor(private readonly apiCodeGenerateService: CG_APIService) {}
    
    @Post()
    async createCode(@Body() body: apiGenDto): Promise<any> {
      const { key } = body;
      return await this.apiCodeGenerateService.generateApi(key);
    }
}
