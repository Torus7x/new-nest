import { Body, Controller, Post } from '@nestjs/common';
import { apiGenDto } from './Dto/apiGen.dto';
import { CG_N8nService } from './cg-n8n.service';

@Controller('n8nCodeGeneration')
export class CG_N8nController {
    constructor(private readonly n8nCodeGenerateService: CG_N8nService) {}

    @Post()
    createCodeforn8n(@Body() body: apiGenDto): Promise<any> {
     const { key } = body;
     return  this.n8nCodeGenerateService.generateApiforn8n(key);
   }
}
