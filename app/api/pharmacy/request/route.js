import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const { prescriptionId, userId } = await request.json();
    console.log('🚀 PHARMACY REQUEST: Updating prescription:', prescriptionId);
    
    await connectDB();
    
    // Update prescription with pharmacy request
    const result = await mongoose.connection.db.collection('dr_prescriptions').updateOne(
      { _id: new mongoose.Types.ObjectId(prescriptionId) },
      { 
        $set: { 
          pharmacyRequested: true,
          requestedAt: new Date(),
          requestedBy: userId
        }
      }
    );
    
    console.log('✅ PHARMACY REQUEST: Update result:', result);
    console.log('✅ PHARMACY REQUEST: Matched count:', result.matchedCount);
    console.log('✅ PHARMACY REQUEST: Modified count:', result.modifiedCount);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error sending pharmacy request:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}