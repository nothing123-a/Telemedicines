import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

async function dbConnect() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MINDBRIDGE');
}
import PrivateDocumentUser from '@/models/PrivateDocumentUser';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Find user
    const user = await PrivateDocumentUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    console.log('User found:', user.email);
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        name: user.name
      },
      'private-docs-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('Login successful');
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Login failed: ' + error.message 
    }, { status: 500 });
  }
}