import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic } from '../schemas/topic.schema';
import { CreateTopicDto, UpdateTopicDto } from '../dto/topic.dto';
import { Doctor } from '../schemas/doctor.schema';
import { ClientProxy, Client, Transport } from '@nestjs/microservices';
import { PaginateWithSearch, PaginateWithSort } from 'src/dto/paginate.dto';


@Injectable()
export class TopicService {
  private client: ClientProxy;
  constructor(
    @InjectModel(Topic.name) private readonly topicModel: Model<Topic>,
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
  ) {}

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
      throw new NotFoundException(`Chủ đề với ID ${id} không tìm thấy`);
    }

    return updatedTopic;
  }

  async remove(id: string): Promise<void> {
    const result = await this.topicModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }
  async findDoctorsByTopic(
    topicId: string,
    paginateDto: PaginateWithSort,
  ): Promise<any> {
    const { current, limit, IsAsc } = paginateDto;
    const skip = (current - 1) * limit;
    const filter: any = { topic: topicId };
    const sortOrder = IsAsc === 'asc' ? 1 : -1;
  
    const [doctors, total] = await Promise.all([
      this.doctorModel.find(filter).skip(skip).limit(limit).sort({ experience: sortOrder }).exec(),
      this.doctorModel.countDocuments(filter).exec(),
    ]);
  
    return {
      total,
      current,
      limit,
      totalPages: Math.ceil(total / limit),
      doctors,
    };
  }  
}
