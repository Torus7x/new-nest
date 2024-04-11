import { Body, Controller, Post } from '@nestjs/common';
import { CG_API_JestService } from './cg-api-jest.service';
import { apiGenDto } from '../Dto/apiGen.dto';

@Controller('testing-code-generate')
export class CG_API_JestController {

    constructor(private readonly aPIGenerationWithIAMJestService: CG_API_JestService) {}

    @Post()
    async createCodefortesting(@Body() body: apiGenDto): Promise<any> {
      const { key } = body;
      return await this.aPIGenerationWithIAMJestService.generatecodefortesting(key);
    }
    
}
