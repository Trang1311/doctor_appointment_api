import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor } from '../schemas/doctor.schema';
import { CreateDoctorDto, UpdateDoctorDto } from '../dto/doctor.dto';
import { AvailableSlot } from '../schemas/availableslot.schema';
import { Appointment } from '../schemas/appointment.schema';
import { User } from '../users/schemas/user.schema';
import { usersDTO } from 'src/users/DTO/user.dto';
import { UsersService } from 'src/users/users.service';
import { throwError } from 'rxjs';
import { PaginateWithSearch } from 'src/dto/paginate.dto';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
    @InjectModel(AvailableSlot.name)
    private readonly availableSlotModel: Model<AvailableSlot>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    if (!createDoctorDto.role) {
      createDoctorDto.role = 'doctor';
    }
    const createUserDto: usersDTO = {
      imageURL: createDoctorDto.imageURL,
      name: createDoctorDto.name,
      username: createDoctorDto.username,
      password: createDoctorDto.password,
      email: createDoctorDto.email,
      gender: createDoctorDto.gender,
      phoneNumber: createDoctorDto.phoneNumber,
      role: 'doctor',
    };
    const user = await this.userService.create(createUserDto);
    const newSlots = createDoctorDto.dailySlots.flatMap((dateSlot) =>
      dateSlot.slots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: dateSlot.date,
      })),
    );

    const savedSlots = await Promise.all(
      newSlots.map((slot) => new this.availableSlotModel(slot).save()),
    );

    const newDoctor = new this.doctorModel({
      ...createDoctorDto,
      password: user.password,
      _id: user._id,
      dailySlots: savedSlots.map((slot) => slot._id),
    });

    return newDoctor.save();
  }

  async findAll(paginateDto: PaginateWithSearch): Promise<any> {
    const { current, limit, Search } = paginateDto;

    const query: any = {};

    if (Search) {
      query.$or = [
        { name: { $regex: new RegExp(Search, 'i') } },
        { specialization: { $regex: new RegExp(Search, 'i') } },
      ];
    }
    const [doctors, total] = await Promise.all([
      this.doctorModel
        .find(query)
        .skip(current * limit)
        .limit(limit)
        .exec(),
      this.doctorModel.countDocuments(query).exec(),
    ]);

    return {
      data: doctors,
      total,
      current,
      limit,
    };
  }
  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findById(id)
      .populate('dailySlots')
      .exec();
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }
  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const existingDoctor = await this.doctorModel
      .findById(id)
      .populate('dailySlots')
      .exec();

    if (!existingDoctor) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }

    let newSlotIds: string[] = [];
    if (updateDoctorDto.dailySlots) {
      const newSlots = updateDoctorDto.dailySlots.flatMap((dateSlot) =>
        dateSlot.slots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: dateSlot.date,
        })),
      );
      const savedSlots = await Promise.all(
        newSlots.map((slot) => new this.availableSlotModel(slot).save()),
      );

      newSlotIds = savedSlots.map((slot) => slot._id.toString());
    }
    const mergedSlotIds = [
      ...existingDoctor.dailySlots.map((slot) => slot._id.toString()),
      ...newSlotIds,
    ];

    if (updateDoctorDto.image) {
      updateDoctorDto.imageURL = updateDoctorDto.image.path;
    }
    const updatedDoctor = await this.doctorModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDoctorDto,
          dailySlots: mergedSlotIds.length ? mergedSlotIds : undefined,
        },
        { new: true },
      )
      .exec();

    if (!updatedDoctor) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }

    return updatedDoctor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  async getAvailableSlots(
    doctorId: string,
    date: Date,
  ): Promise<AvailableSlot[]> {
    const doctor = await this.doctorModel
      .findById(doctorId)
      .populate('dailySlots')
      .exec();

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }
    const bookedSlots = await this.appointmentModel
      .find({ doctor: doctorId, date })
      .exec();
    const availableSlots = doctor.dailySlots
      .flatMap((slot) => bookedSlots)
      .filter(
        (slot) =>
          !bookedSlots.some(
            (booked) =>
              booked.startTime === slot.startTime &&
              booked.endTime === slot.endTime,
          ),
      );

    return availableSlots;
  }

  async bookSlot(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
    userId: string,
  ): Promise<void> {
    const availableSlots = await this.getAvailableSlots(doctorId, date);

    const slotAvailable = availableSlots.some(
      (slot) => slot.startTime === startTime && slot.endTime === endTime,
    );

    if (!slotAvailable) {
      throw new BadRequestException('Slot not available');
    }
    const appointment = new this.appointmentModel({
      doctor: doctorId,
      date,
      startTime,
      endTime,
      userId,
    });
    await appointment.save();
  }
}
