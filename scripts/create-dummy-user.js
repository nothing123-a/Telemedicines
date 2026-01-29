const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  phone: String,
  documents: [{
    id: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    uploadDate: String,
    status: String
  }]
});

const User = mongoose.model('User', userSchema);

async function createDummyUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/minds');
    
    console.log('Connected to MongoDB');
    
    // Create dummy user with sample documents
    const dummyUser = new User({
      _id: 'test-user-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      documents: [
        {
          id: '1',
          fileName: 'Blood_Test_Report.pdf',
          fileType: 'application/pdf',
          fileSize: 245760,
          uploadDate: '2024-01-15T10:30:00Z',
          status: 'uploaded'
        },
        {
          id: '2',
          fileName: 'X_Ray_Chest.jpg',
          fileType: 'image/jpeg',
          fileSize: 512000,
          uploadDate: '2024-01-10T14:20:00Z',
          status: 'uploaded'
        },
        {
          id: '3',
          fileName: 'Prescription_Jan2024.pdf',
          fileType: 'application/pdf',
          fileSize: 128000,
          uploadDate: '2024-01-05T09:15:00Z',
          status: 'uploaded'
        }
      ]
    });
    
    // Save user (replace if exists)
    await User.findOneAndUpdate(
      { _id: 'test-user-123' },
      dummyUser.toObject(),
      { upsert: true, new: true }
    );
    
    console.log('✅ Dummy user created successfully!');
    console.log('User ID: test-user-123');
    console.log('Documents: 3 sample files added');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating dummy user:', error);
    process.exit(1);
  }
}

createDummyUser();