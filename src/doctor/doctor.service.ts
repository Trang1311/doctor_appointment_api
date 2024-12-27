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
import { PaginateWithFilter, PaginateWithSearch } from 'src/dto/paginate.dto';
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
    const newSlots = (createDoctorDto.dailySlots || []).flatMap((dateSlot) =>
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

  async findAll(paginateDto: PaginateWithFilter): Promise<any> {
    const {
      current = 0,
      limit = 10,
      Search,
      clinicAddress,
      minExperience,
      maxExperience,
      IsAsc = 'asc',
      topicId,
    } = paginateDto;

    const query: any = {};

    // Tìm kiếm theo tên hoặc chuyên khoa
    if (Search) {
      query.$or = [
        { name: { $regex: new RegExp(Search, 'i') } },
        { specialization: { $regex: new RegExp(Search, 'i') } },
      ];
    }

    // Lọc theo địa chỉ phòng khám
    if (clinicAddress) {
      const addresses = Array.isArray(clinicAddress)
        ? clinicAddress
        : clinicAddress.split(',').map((addr) => addr.trim());

      query.clinicAddress = {
        $in: addresses.map((addr) => new RegExp(addr, 'i')),
      };
    }

    // Lọc số năm kinh nghiệm
    if (minExperience !== undefined || maxExperience !== undefined) {
      query.experience = {};
      if (minExperience !== undefined) {
        query.experience.$gte = minExperience;
      }
      if (maxExperience !== undefined) {
        query.experience.$lte = maxExperience;
      }
    }
    if (topicId) {
      query.topic = topicId;
    }
    const sort: { [key: string]: 1 | -1 } = {
      experience: IsAsc === 'desc' ? 1 : -1,
    };

    const [doctors, total] = await Promise.all([
      this.doctorModel
        .find(query)
        .sort(sort)
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
  async getProvinceStats(filterDto: PaginateWithFilter): Promise<any> {
    const { minExperience, maxExperience } = filterDto;
    const query: any = {};

    // Lọc theo kinh nghiệm
    if (minExperience !== undefined || maxExperience !== undefined) {
      query.experience = {};
      if (minExperience !== undefined) {
        query.experience.$gte = minExperience;
      }
      if (maxExperience !== undefined) {
        query.experience.$lte = maxExperience;
      }
    }

    // Lấy danh sách tất cả bác sĩ
    const doctors = await this.doctorModel.find().exec();

    // Lấy danh sách tất cả các tỉnh từ dữ liệu
    const allProvinces = new Set<string>();
    doctors.forEach((doctor) => {
      if (doctor.clinicAddress) {
        const addressParts = doctor.clinicAddress.split(', ');
        const province = addressParts[addressParts.length - 1];
        allProvinces.add(province);
      }
    });

    // Tính tổng số bác sĩ theo bộ lọc
    const filteredDoctors = await this.doctorModel.find(query).exec();
    const provincesMap: Record<string, number> = {};
    filteredDoctors.forEach((doctor) => {
      if (doctor.clinicAddress) {
        const addressParts = doctor.clinicAddress.split(', ');
        const province = addressParts[addressParts.length - 1];
        provincesMap[province] = (provincesMap[province] || 0) + 1;
      }
    });

    // Đảm bảo tất cả các tỉnh đều có trong danh sách kết quả
    const provinces = Array.from(allProvinces).map((province) => ({
      province,
      totalDoctors: provincesMap[province] || 0,
    }));
    const experienceStats = {
      maxExperience:
        filteredDoctors.length > 0
          ? Math.max(...filteredDoctors.map((doc) => doc.experience))
          : 0,
      minExperience:
        filteredDoctors.length > 0
          ? Math.min(...filteredDoctors.map((doc) => doc.experience))
          : 0,
    };

    return {
      provinces,
      experienceStats,
    };
  }

  async getAllDoctor(): Promise<Doctor[]> {
    return this.doctorModel.find().exec();
  }
  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findById(id)
      .populate('dailySlots')
      .exec();
    if (!doctor) {
      throw new NotFoundException(`Bác sĩ với ID ${id} không tìm thấy`);
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
    if (updateDoctorDto.dailySlots && updateDoctorDto.dailySlots.length > 0) {
      const currentSlots = existingDoctor.dailySlots.map((slot: any) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: new Date(slot.date).toISOString().split('T')[0],
      }));

      const newSlots = updateDoctorDto.dailySlots.flatMap((dateSlot) =>
        dateSlot.slots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: dateSlot.date,
        })),
      );
      const uniqueNewSlots = newSlots.filter(
        (newSlot) =>
          !currentSlots.some(
            (existingSlot) =>
              existingSlot.date === newSlot.date &&
              existingSlot.startTime === newSlot.startTime &&
              existingSlot.endTime === newSlot.endTime,
          ),
      );
      const savedSlots = await Promise.all(
        uniqueNewSlots.map((slot) => new this.availableSlotModel(slot).save()),
      );

      newSlotIds = savedSlots.map((slot) => slot._id.toString());
    }
    const mergedSlotIds = [
      ...existingDoctor.dailySlots.map((slot) => slot._id.toString()),
      ...newSlotIds,
    ];
    if (typeof updateDoctorDto.experience === 'string') {
      const experienceNumber = Number(updateDoctorDto.experience);
      if (!isNaN(experienceNumber)) {
        updateDoctorDto.experience = experienceNumber;
      } else {
        throw new BadRequestException(`Experience must be a valid number`);
      }
    }
    if (updateDoctorDto.image) {
      updateDoctorDto.imageURL = updateDoctorDto.image.path;
    }

    if (updateDoctorDto.imageURL) {
      await this.userService.update(id, { imageURL: updateDoctorDto.imageURL });
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
  async removeSlotsByDate(id: string, date: string): Promise<Doctor> {
    const existingDoctor = await this.doctorModel
      .findById(id)
      .populate('dailySlots')
      .exec();

    if (!existingDoctor) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }

    const targetDate = new Date(date).toISOString().split('T')[0];
    const slotsToRemove = existingDoctor.dailySlots.filter(
      (slot: any) =>
        new Date(slot.date).toISOString().split('T')[0] === targetDate,
    );
    if (slotsToRemove.length === 0) {
      throw new NotFoundException(
        `No slots found for the date "${targetDate}"`,
      );
    }
    const slotIdsToRemove = slotsToRemove.map((slot: any) => slot._id);
    await this.availableSlotModel
      .deleteMany({ _id: { $in: slotIdsToRemove } })
      .exec();
    existingDoctor.dailySlots = existingDoctor.dailySlots.filter(
      (slot: any) => !slotIdsToRemove.includes(slot._id),
    );

    const updatedDoctor = await existingDoctor.save();

    return updatedDoctor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Bác sĩ với ID ${id} không tìm thấy`);
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
      throw new NotFoundException(`Bác sĩ với ID ${doctorId} không tim thấy`);
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
      throw new BadRequestException('Khung giờ không hợp lệ');
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
