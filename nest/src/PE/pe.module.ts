import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PeController } from '../PE/pe.controller';
import { PeService } from '../PE/pe.service';
import { RedisService } from 'src/redisService';



@Module({
  imports: [HttpModule],
  controllers: [PeController],
  providers: [PeService,RedisService],
})
export class PeModule {}

