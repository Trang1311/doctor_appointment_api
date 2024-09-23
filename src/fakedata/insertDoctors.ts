import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

// Define the Doctor schema
const doctorSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  email: { type: String, unique: true },
  phoneNumber: String,
  gender: String,
  role: String,
  specialization: String,
  experience: Number,
  qualifications: String,
  clinicAddress: String,
  lifeMotto: String,
  dailySlots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AvailableSlot' }],
  topic: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
});

const Doctor = mongoose.model('Doctor', doctorSchema);

const uri = 'mongodb://127.0.0.1:27017/doctor_appointment';
mongoose
  .connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

const generateDoctors = async () => {
  const doctors = [];

  for (let i = 0; i < 1000; i++) {
    const doctor = {
      name: faker.name.fullName(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      role: 'doctor',
      specialization: faker.helpers.arrayElement([
        'Cardiology',
        'Dermatology',
        'Pediatrics',
        'Psychiatry',
        'Radiology',
      ]),
      experience: faker.number.int({ min: 1, max: 40 }),
      qualifications: faker.lorem.words(3),
      clinicAddress: faker.address.streetAddress(),
      lifeMotto: faker.lorem.sentence(),
      dailySlots: [new mongoose.Types.ObjectId()], // Replace with actual AvailableSlot IDs
      topic: [new mongoose.Types.ObjectId()], // Replace with actual Topic IDs
    };

    doctors.push(doctor);
  }

  try {
    // Insert the generated doctors into the MongoDB collection
    await Doctor.insertMany(doctors);
    console.log('Doctors inserted successfully');
  } catch (err) {
    console.error('Error inserting doctors:', err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

generateDoctors();
