import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const sosData = await request.json();
    
    // Create database directory if it doesn't exist
    const dbDir = join(process.cwd(), 'data', 'sos');
    await mkdir(dbDir, { recursive: true });

    // Save SOS record to JSON file (mock database)
    const sosRecord = {
      id: Date.now(),
      ...sosData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const filename = `sos_${sosRecord.id}.json`;
    const filepath = join(dbDir, filename);
    
    await writeFile(filepath, JSON.stringify(sosRecord, null, 2));

    console.log('SOS Record saved:', sosRecord);

    return NextResponse.json({
      success: true,
      id: sosRecord.id,
      message: 'SOS record saved successfully'
    });

  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save SOS record' }, { status: 500 });
  }
}