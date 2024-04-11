import { Module } from '@nestjs/common';
import { CG_CommonService } from './cg-common.service';

@Module({
  providers: [CG_CommonService],
  exports: [CG_CommonService],
})
export class CgCommonModule {}
