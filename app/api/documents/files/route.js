import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

async function dbConnect() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MINDBRIDGE');
}
import PrivateDocumentUser from '@/models/PrivateDocumentUser';
import Document from '@/models/PrivateDocument';

function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header found');
      return null;
    }
    
    const token = authHeader.substring(7);
    console.log('Verifying token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, 'private-docs-secret-key');
    console.log('Token decoded successfully:', decoded.userId);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const userToken = getUserFromToken(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await PrivateDocumentUser.findById(userToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get documents for this user
    const documents = await Document.find({ userId: user._id }).sort({ uploadDate: -1 });
    
    return NextResponse.json({
      documents: documents.map(doc => ({
        id: doc._id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadDate: doc.uploadDate,
        status: doc.status
      })),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('📤 POST /api/documents/files - Starting upload...');
    
    await dbConnect();
    console.log('✅ Database connected');
    
    const userToken = getUserFromToken(request);
    if (!userToken) {
      console.log('❌ No valid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ Token valid for user:', userToken.userId);
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { fileName, fileType, fileSize } = body;
    
    if (!fileName) {
      console.log('❌ Missing fileName');
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }
    
    const user = await PrivateDocumentUser.findById(userToken.userId);
    if (!user) {
      console.log('❌ User not found:', userToken.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('✅ User found:', user.email);
    
    // Create new document
    const documentData = {
      userId: user._id,
      fileName: fileName || 'Untitled',
      fileType: fileType || 'application/octet-stream',
      fileSize: fileSize || 0,
      uploadDate: new Date(),
      status: 'uploaded'
    };
    
    console.log('💾 Creating document:', documentData);
    
    const newDocument = new Document(documentData);
    const savedDocument = await newDocument.save();
    
    console.log('✅ Document saved with ID:', savedDocument._id);
    
    return NextResponse.json({
      success: true,
      document: {
        id: savedDocument._id,
        fileName: savedDocument.fileName,
        fileType: savedDocument.fileType,
        fileSize: savedDocument.fileSize,
        uploadDate: savedDocument.uploadDate,
        status: savedDocument.status
      }
    });
    
  } catch (error) {
    console.error('❌ Upload document error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to save document: ' + error.message 
    }, { status: 500 });
  }
}