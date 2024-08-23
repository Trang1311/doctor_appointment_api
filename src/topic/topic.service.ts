import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic } from '../schemas/topic.schema';
import { CreateTopicDto, UpdateTopicDto } from '../dto/topic.dto';
import { Doctor } from '../schemas/doctor.schema';
import { ClientProxy, Client, Transport } from '@nestjs/microservices';

@Injectable()
export class TopicService {
  private client: ClientProxy;
  constructor(@InjectModel(Topic.name) private readonly topicModel: Model<Topic>,
  @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const newTopic = new this.topicModel(createTopicDto);
    await newTopic.save();
    this.client.emit('topic_created', { id: newTopic._id, ...createTopicDto });

    return newTopic;
  }

  async findAll(): Promise<Topic[]> {
    return this.topicModel.find().exec();
  }

  async findById(id: string): Promise<Topic> {
    const topic = await this.topicModel.findById(id).exec();
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    const updatedTopic = await this.topicModel
      .findByIdAndUpdate(id, updateTopicDto, { new: true })
      .exec();

    if (!updatedTopic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return updatedTopic;
  }

  async remove(id: string): Promise<void> {
    const result = await this.topicModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }
  async findDoctorsByTopic(topicId: string): Promise<Doctor[]> {
    return this.doctorModel.find({ topic: topicId }).exec();
  }
}
