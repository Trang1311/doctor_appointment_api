import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto/appointments.dto';
import { ApiTags, ApiOperation, ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create an appointment' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(createAppointmentDto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm an appointment and send email notification' })
  async confirm(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentService.updateAppointment(id, updateAppointmentDto);
  }
}
