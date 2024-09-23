import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

// Định nghĩa schemas
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
  topic: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topics' }], // Đã cập nhật tên schema
});

const Doctor = mongoose.model('Doctor', doctorSchema);
const AvailableSlot = mongoose.model('AvailableSlot', new mongoose.Schema({})); // Define schema as needed
const Topics = mongoose.model('Topics', new mongoose.Schema({})); // Đã cập nhật tên schema

const uri = 'mongodb://127.0.0.1:27017/doctor_appointment';
mongoose
  .connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

const generateDoctors = async () => {
  try {
    // Fetch available slot IDs and topic IDs
    const availableSlots = await AvailableSlot.find().select('_id');
    const topics = await Topics.find().select('_id');

    if (availableSlots.length === 0 || topics.length === 0) {
      throw new Error('No available slots or topics found in the database.');
    }

    const availableSlotIds = availableSlots.map((slot) => slot._id);
    const topicIds = topics.map((topic) => topic._id);

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
        dailySlots: faker.helpers.arrayElements(availableSlotIds, {
          min: 1,
          max: 3,
        }), // Randomly select 1 to 3 available slots
        topic: faker.helpers.arrayElements(topicIds, { min: 1, max: 3 }), // Randomly select 1 to 3 topics
      };

      doctors.push(doctor);
    }

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
