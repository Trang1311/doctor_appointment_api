import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Doctor } from '../schemas/doctor.schema';
import { Appointment } from '../schemas/appointment.schema';
import { Topic } from '../schemas/topic.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Topic.name) private readonly topicModel: Model<Topic>,
  ) {}

  async getDashboardStats() {
    const guestCountPromise = this.userModel.countDocuments({ role: 'guest' });
    const doctorCountPromise = this.userModel.countDocuments({
      role: 'doctor',
    });

    const topicWithMostDoctorsPromise = this.doctorModel.aggregate([
      { $unwind: '$topic' },
      { $group: { _id: '$topic', doctorCount: { $sum: 1 } } },
      { $sort: { doctorCount: -1 } },
      { $limit: 1 },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const appointmentsTodayPromise = this.appointmentModel.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    const provinceWithMostClinicsPromise = this.doctorModel.aggregate([
      {
        $project: {
          province: {
            $trim: {
              input: {
                $arrayElemAt: [{ $split: ['$clinicAddress', ','] }, -1],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$province',
          clinicCount: { $sum: 1 },
        },
      },
      { $sort: { clinicCount: -1 } },
      { $limit: 10 },
      {
        $group: {
          _id: null,
          topProvince: { $first: '$_id' },
          topProvinceCount: { $first: '$clinicCount' },
          allProvinces: {
            $push: { province: '$_id', clinicCount: '$clinicCount' },
          },
          totalClinics: { $sum: '$clinicCount' },
        },
      },
      {
        $project: {
          _id: 0,
          topProvince: 1,
          topProvinceCount: 1,
          allProvinces: 1,
          totalClinics: 1,
        },
      },
    ]);

    const topDoctorsPromise = this.appointmentModel.aggregate([
      {
        $group: {
          _id: '$doctorname',
          appointmentCount: { $sum: 1 },
        },
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 },
      {
        $group: {
          _id: null,
          topDoctors: {
            $push: {
              doctorName: '$_id',
              appointmentCount: '$appointmentCount',
            },
          },
          totalAppointments: { $sum: '$appointmentCount' },
        },
      },
      {
        $project: {
          _id: 0,
          topDoctors: 1,
          totalAppointments: 1,
        },
      },
    ]);

    const onlineAppointmentsPromise = this.appointmentModel.countDocuments({
      appointmentType: 'Video Call',
    });
    const inPersonAppointmentsPromise = this.appointmentModel.countDocuments({
      appointmentType: 'In-Person',
    });

    // Bác sĩ có kinh nghiệm nhiều nhất của mỗi topic
    const topExperiencedDoctorsByTopicPromise = this.doctorModel.aggregate([
      { $unwind: '$topic' },
      {
        $group: {
          _id: '$topic',
          doctor: {
            $first: {
              doctorId: '$_id',
              name: '$name',
              experience: '$experience',
              qualifications: '$qualifications',
              clinicAddress: '$clinicAddress',
              imageURL: '$imageURL',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'availableslots',
          localField: 'doctor.dailySlots',
          foreignField: '_id',
          as: 'doctor.dailySlots',
        },
      },
      {
        $sort: {
          'doctor.experience': -1,
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: '_id',
          as: 'topicDetails',
        },
      },
      {
        $unwind: '$topicDetails',
      },
      {
        $project: {
          _id: 1,
          topicName: '$topicDetails.name',
          doctor: 1,
        },
      },
    ]);

    const [
      guestCount,
      doctorCount,
      topicWithMostDoctors,
      appointmentsToday,
      provinceWithMostClinics,
      topDoctors,
      onlineAppointments,
      inPersonAppointments,
      topExperiencedDoctorsByTopic,
    ] = await Promise.all([
      guestCountPromise,
      doctorCountPromise,
      topicWithMostDoctorsPromise,
      appointmentsTodayPromise,
      provinceWithMostClinicsPromise,
      topDoctorsPromise,
      onlineAppointmentsPromise,
      inPersonAppointmentsPromise,
      topExperiencedDoctorsByTopicPromise,
    ]);

    // Tìm tên topic
    let topicInfo = null;
    if (topicWithMostDoctors.length) {
      const topic = await this.topicModel
        .findById(topicWithMostDoctors[0]._id)
        .exec();
      topicInfo = {
        name: topic?.name || 'Unknown',
        doctorCount: topicWithMostDoctors[0].doctorCount,
      };
    }

    return {
      userStats: { guestCount, doctorCount },
      topicWithMostDoctors: topicInfo,
      appointmentsToday,
      provinceWithMostClinics: provinceWithMostClinics.length
        ? provinceWithMostClinics[0]
        : null,
      topDoctors,
      onlineAppointments,
      inPersonAppointments,
      topExperiencedDoctorsByTopic,
    };
  }
}
