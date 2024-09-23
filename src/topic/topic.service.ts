import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic } from '../schemas/topic.schema';
import { CreateTopicDto, UpdateTopicDto } from '../dto/topic.dto';
import { Doctor } from '../schemas/doctor.schema';
import { ClientProxy, Client, Transport } from '@nestjs/microservices';
import { PaginateWithSearch } from 'src/dto/paginate.dto';

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
  async findDoctorsByTopic(
    topicId: string,
    paginateDto: PaginateWithSearch,
  ): Promise<any> {
    const { current, limit } = paginateDto;
    const skip = (current - 1) * limit;

    // Tạo điều kiện tìm kiếm
    const filter: any = { topic: topicId };
    // Thực hiện phân trang và tìm kiếm
    const [doctors, total] = await Promise.all([
      this.doctorModel.find(filter).skip(skip).limit(limit).exec(),
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
