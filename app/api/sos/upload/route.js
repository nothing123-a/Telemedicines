import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');
    const timestamp = formData.get('timestamp');
    const location = formData.get('location');
    const locationText = formData.get('locationText');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'sos');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.webm`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const mediaRecord = {
      id: Date.now(),
      filename,
      type,
      timestamp,
      location: JSON.parse(location || '{}'),
      locationText,
      url: `/uploads/sos/${filename}`,
      size: buffer.length
    };

    return NextResponse.json({
      success: true,
      url: mediaRecord.url,
      id: mediaRecord.id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}