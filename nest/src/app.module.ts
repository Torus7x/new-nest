import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './redisService';
import { PeModule } from './PE/pe.module';
import { UfdModule } from './VPT/ufd/ufd.module';
import { UfSldModule } from './VPT/uf_sld/uf_sld.module';
import { PfdModule } from './VPT/pfd/pfd.module';
import { PfPfdModule } from './VPT/pf_pfd/pf_pfd.module';
import { DfdModule } from './VPT/dfd/dfd.module';
import { DfErdModule } from './VPT/df_erd/df_erd.module';

import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './ExceptionFilter/exception.filter';
import { LoggerMiddleware } from './Middleware/middleware';
import { CgCommonModule } from './cg-common/cg-common.module';
import { CG_APIModule } from './cg-api/cg-api.module';
import { CG_N8n } from './cg-n8n/cg-n8n.module';
import { CG_NextUiModule } from './cg-next-ui/cg-next-ui.module';
import { CG_API_JestModule } from './cg-api-jest/cg-api-jest.module';
import { CG_ER_APIModule } from './cg-er-api/cg-er-api.module';

@Module({
  imports: [
    PeModule,
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    CgCommonModule,
    CG_APIModule,
    CG_N8n,
    CG_NextUiModule,
    CG_API_JestModule,
    UfdModule,
    UfSldModule,
    PfdModule,
    PfPfdModule,
    DfdModule,
    DfErdModule,
    CG_ER_APIModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
