const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://progamerz9764:refinify1432@refinify.jovjgcc.mongodb.net/MINDBRIDGE';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  isDoctor: { type: Boolean, default: false },
  isPharmacist: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

// Pharmacist Schema
const pharmacistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  pharmacyName: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  address: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Pharmacist = mongoose.models.Pharmacist || mongoose.model('Pharmacist', pharmacistSchema);

async function addDummyUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Hash password
    const hashedPassword = await bcrypt.hash('demo123', 12);

    // Dummy Patient User
    const patientUser = {
      name: 'Demo Patient',
      email: 'patient1@demo.com',
      password: hashedPassword,
      phone: '+91 9876543210',
      isDoctor: false,
      isPharmacist: false
    };

    // Dummy Doctor User
    const doctorUser = {
      name: 'Dr. Demo Doctor',
      email: 'doctor@demo.com',
      password: hashedPassword,
      specialization: 'General Medicine',
      experience: 5,
      phone: '+91 9876543211',
      status: 'online',
      isVerified: true
    };

    // Dummy Pharmacist User
    const pharmacistUser = {
      name: 'Demo Pharmacist',
      email: 'pharmacist@demo.com',
      password: hashedPassword,
      phone: '+91 9876543212',
      pharmacyName: 'Demo Pharmacy',
      licenseNumber: 'PH123456789',
      address: '123 Demo Street, Demo City',
      isVerified: true
    };

    // Add Patient to User collection
    try {
      await User.findOneAndUpdate(
        { email: patientUser.email },
        patientUser,
        { upsert: true, new: true }
      );
      console.log('✅ Patient user added/updated successfully');
    } catch (error) {
      console.log('Patient user already exists or error:', error.message);
    }

    // Add Doctor to Doctor collection
    try {
      await Doctor.findOneAndUpdate(
        { email: doctorUser.email },
        doctorUser,
        { upsert: true, new: true }
      );
      console.log('✅ Doctor user added/updated successfully');
    } catch (error) {
      console.log('Doctor user already exists or error:', error.message);
    }

    // Add Pharmacist to Pharmacist collection
    try {
      await Pharmacist.findOneAndUpdate(
        { email: pharmacistUser.email },
        pharmacistUser,
        { upsert: true, new: true }
      );
      console.log('✅ Pharmacist user added/updated successfully');
    } catch (error) {
      console.log('Pharmacist user already exists or error:', error.message);
    }

    console.log('\n🎉 All dummy users have been added to the database!');
    console.log('\nLogin Credentials:');
    console.log('Patient: patient1@demo.com / demo123');
    console.log('Doctor: doctor@demo.com / demo123');
    console.log('Pharmacist: pharmacist@demo.com / demo123');

  } catch (error) {
    console.error('❌ Error adding dummy users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
addDummyUsers();