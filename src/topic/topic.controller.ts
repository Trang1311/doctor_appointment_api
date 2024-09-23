import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto, UpdateTopicDto } from '../dto/topic.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Topic } from '../schemas/topic.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Doctor } from '../schemas/doctor.schema';
import { PaginateWithSearch } from 'src/dto/paginate.dto';

@ApiTags('topics')
@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({
    status: 201,
    description: 'The topic has been successfully created.',
    type: Topic,
  })
  async create(@Body() createTopicDto: CreateTopicDto): Promise<Topic> {
    return this.topicService.create(createTopicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({
    status: 200,
    description: 'Return all topics.',
    type: [Topic],
  })
  async findAll(): Promise<Topic[]> {
    return this.topicService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a topic by ID' })
  @ApiResponse({ status: 200, description: 'Return the topic.', type: Topic })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findById(@Param('id') id: string): Promise<Topic> {
    return this.topicService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a topic' })
  @ApiResponse({
    status: 200,
    description: 'The topic has been successfully updated.',
    type: Topic,
  })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<Topic> {
    return this.topicService.update(id, updateTopicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiResponse({
    status: 200,
    description: 'The topic has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.topicService.remove(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':topicId/doctors')
  async findDoctorsByTopic(
    @Param('topicId') topicId: string,
    @Query() paginateDto: PaginateWithSearch,
  ) {
    return this.topicService.findDoctorsByTopic(topicId, paginateDto);
  }
}
