import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import {
  CreateDoctorDto,
  RemoveSlotsDto,
  UpdateDoctorDto,
} from '../dto/doctor.dto';
import { PaginateWithFilter, PaginateWithSearch } from 'src/dto/paginate.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Doctor } from '../schemas/doctor.schema';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { doctorStorage } from 'src/cloudinary/cloudinary.storage';
import { ValidationPipe, UsePipes } from '@nestjs/common';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({
    status: 201,
    description: 'The doctor has been successfully created.',
    type: Doctor,
  })
  async create(@Body() createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    return this.doctorService.create(createDoctorDto);
  }

  @Get('/pag')
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({
    status: 200,
    description: 'Return all doctors.',
    type: [Doctor],
  })
  async findAllwithPag(@Query() paginateDto: PaginateWithFilter) {
    return this.doctorService.findAll(paginateDto);
  }

  @Get('province-stats')
  async getProvinceStats(@Query() filterDto: PaginateWithFilter) {
    return await this.doctorService.getProvinceStats(filterDto);
  }
  @Get('/all')
  async GetAllDoctor() {
    return this.doctorService.getAllDoctor();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a doctor by ID' })
  @ApiResponse({ status: 200, description: 'Return the doctor.', type: Doctor })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findById(@Param('id') id: string): Promise<Doctor> {
    return this.doctorService.findById(id);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', { storage: doctorStorage }))
  @ApiOperation({ summary: 'Update a doctor' })
  @ApiResponse({
    status: 200,
    description: 'The doctor has been successfully updated.',
    type: Doctor,
  })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    if (file) {
      updateDoctorDto.image = file;
    }
    console.log(
      'Experience received:',
      updateDoctorDto.experience,
      typeof updateDoctorDto.experience,
    );

    if (
      updateDoctorDto.experience !== undefined &&
      updateDoctorDto.experience !== null
    ) {
      updateDoctorDto.experience = Number(updateDoctorDto.experience);
    }
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id/slots')
  @ApiBody({ type: RemoveSlotsDto })
  async removeSlotsByDate(
    @Param('id') id: string,
    @Body() removeSlotsDto: RemoveSlotsDto,
  ): Promise<Doctor> {
    return this.doctorService.removeSlotsByDate(id, removeSlotsDto.date);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a doctor' })
  @ApiResponse({
    status: 200,
    description: 'The doctor has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.doctorService.remove(id);
  }

  @Post(':id/book')
  @ApiOperation({ summary: 'Book a slot for a doctor' })
  @ApiResponse({
    status: 201,
    description: 'The slot has been successfully booked.',
  })
  async bookSlot(
    @Param('id') id: string,
    @Body('date') date: Date,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
    @Body('userId') userId: string,
  ): Promise<void> {
    await this.doctorService.bookSlot(id, date, startTime, endTime, userId);
  }
}
