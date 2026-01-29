import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import PrivateDocumentUser from '@/models/PrivateDocumentUser';
import Document from '@/models/PrivateDocument';

async function dbConnect() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MINDBRIDGE');
}

function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, 'private-docs-secret-key');
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const userToken = getUserFromToken(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const docId = params.id;
    
    // Find and delete document belonging to this user
    const deletedDoc = await Document.findOneAndDelete({
      _id: docId,
      userId: userToken.userId
    });
    
    if (!deletedDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Document deleted' });
    
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}