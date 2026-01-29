import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

async function dbConnect() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MINDBRIDGE');
}
import PrivateDocumentUser from '@/models/PrivateDocumentUser';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { name, email, password, phone } = await request.json();
    
    console.log('Registration request:', { name, email, phone });
    
    if (!name || !email || !password) {
      return NextResponse.json({ 
        error: 'Name, email and password are required' 
      }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await PrivateDocumentUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User already exists with this email' 
      }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new PrivateDocumentUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone || ''
    });
    
    const savedUser = await user.save();
    console.log('User created:', savedUser._id);
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Registration failed: ' + error.message 
    }, { status: 500 });
  }
}