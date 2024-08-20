import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, UpdateDoctorDto } from '../dto/doctor.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Doctor } from '../schemas/doctor.schema';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'The doctor has been successfully created.', type: Doctor })
  async create(@Body() createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    return this.doctorService.create(createDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({ status: 200, description: 'Return all doctors.', type: [Doctor] })
  async findAll(): Promise<Doctor[]> {
    return this.doctorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a doctor by ID' })
  @ApiResponse({ status: 200, description: 'Return the doctor.', type: Doctor })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findById(@Param('id') id: string): Promise<Doctor> {
    return this.doctorService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a doctor' })
  @ApiResponse({ status: 200, description: 'The doctor has been successfully updated.', type: Doctor })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a doctor' })
  @ApiResponse({ status: 200, description: 'The doctor has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.doctorService.remove(id);
  }
  @Post(':id/book')
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
