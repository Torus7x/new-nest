import { Controller, Get,Post, Body } from '@nestjs/common';
import { PeService } from '../PE/pe.service';

@Controller('pe')
export class PeController {
  constructor(private readonly appService: PeService) {}
  

  @Get()
  async setData(@Body() data) : Promise<any> {
    return await this.appService.setData(data);
  }  
 
  @Post()
  async getProcess(@Body() input): Promise<any> {   
       return await this.appService.getProcess(input.key);       
  } 

  @Post('formdata')
  async getFormdata(@Body() input): Promise<any> {  
     console.log(input);
     
       return await this.appService.getFormdata(input.key, input.formdata);       
  } 

  @Post('npc')
  async getvariables(@Body() input): Promise<any> {   
       return await this.appService.getvariables(input.key);       
  }
  
  @Get('processLog')
  async getPrcLogs(): Promise<any> {   
       return await this.appService.getPrcLogs();       
  }
}
