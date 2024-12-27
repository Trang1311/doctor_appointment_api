import { Module } from '@nestjs/common';
import { RecService } from './recommend.service';
import { RecController } from './recommend.controller';

@Module({
  providers: [RecService],
  controllers: [RecController],
  exports: [RecService],
})
export class RecModule {}
