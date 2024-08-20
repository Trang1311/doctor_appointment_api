import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { Topic, TopicSchema } from '../schemas/topic.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }])],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
