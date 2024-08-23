import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { Topic, TopicSchema } from '../schemas/topic.schema';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema },
    { name: Doctor.name, schema: DoctorSchema },])],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
