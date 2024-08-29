// src/services/doctor.service.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor } from '../schemas/doctor.schema';
import { CreateDoctorDto, UpdateDoctorDto } from '../dto/doctor.dto';
import { AvailableSlot } from '../schemas/availableslot.schema';
import { Appointment } from '../schemas/appointment.schema';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
    @InjectModel(AvailableSlot.name) private readonly availableSlotModel: Model<AvailableSlot>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Flatten and save available slots
    const dailySlots = createDoctorDto.dailySlots.flatMap(dateSlot =>
      dateSlot.slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: dateSlot.date
      }))
    );

    const savedSlots = await Promise.all(
      dailySlots.map(slot => new this.availableSlotModel(slot).save())
    );
    const newDoctor = new this.doctorModel({
      ...createDoctorDto,
      dailySlots: savedSlots.map(slot => slot._id), // Ensure this is an array of ObjectIds
    });
    
    return newDoctor.save();
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorModel.find().populate('dailySlots').exec();
  }

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id).populate('dailySlots').exec();
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    let newSlotIds: string[] = [];

    if (updateDoctorDto.dailySlots) {
      const newSlots = updateDoctorDto.dailySlots.flatMap(dateSlot =>
        dateSlot.slots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: dateSlot.date
        }))
      );

      // Save new available slots and get their IDs
      const savedSlots = await Promise.all(
        newSlots.map(slot => new this.availableSlotModel(slot).save())
      );

      newSlotIds = savedSlots.map(slot => slot._id.toString()); // Ensure this is an array of ObjectIds
    }

    // Update doctor with new available slot IDs
    const updatedDoctor = await this.doctorModel
      .findByIdAndUpdate(id, {
        ...updateDoctorDto,
        dailySlots: newSlotIds.length ? newSlotIds : undefined
      }, { new: true })
      .exec();

    if (!updatedDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return updatedDoctor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  async getAvailableSlots(doctorId: string, date: Date): Promise<AvailableSlot[]> {
    const doctor = await this.doctorModel.findById(doctorId).populate('dailySlots').exec();

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }
    const bookedSlots = await this.appointmentModel.find({ doctor: doctorId, date }).exec();
    const availableSlots = doctor.dailySlots
      .flatMap(slot => bookedSlots)
      .filter(slot =>
        !bookedSlots.some(booked => booked.startTime === slot.startTime && booked.endTime === slot.endTime)
      );

    return availableSlots;
  }

  async bookSlot(doctorId: string, date: Date, startTime: string, endTime: string, userId: string): Promise<void> {
    const availableSlots = await this.getAvailableSlots(doctorId, date);

    const slotAvailable = availableSlots.some(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!slotAvailable) {
      throw new BadRequestException('Slot not available'); 
    }
    const appointment = new this.appointmentModel({ doctor: doctorId, date, startTime, endTime, userId });
    await appointment.save();
  }
}
