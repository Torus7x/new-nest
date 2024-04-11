import { Body, Controller, Post } from '@nestjs/common';
import { CG_NextUiService } from './cg-next-ui.service';
import { apiGenDto } from 'src/Dto/apiGen.dto';

@Controller('NextUi')
export class CG_NextUiController {
  constructor(private readonly dynamicUfGenNextUiService: CG_NextUiService) {}

  @Post()
  async createCode(@Body() body: apiGenDto): Promise<any> {
    const { key } = body;
    return await this.dynamicUfGenNextUiService.generateApi(key);
  }
}
