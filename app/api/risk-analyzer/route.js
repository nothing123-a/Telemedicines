import { NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:8002';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Forward to Python backend
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const response = await fetch(`${PYTHON_BACKEND_URL}/analyze-report`, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!response.ok) {
      throw new Error(`Python backend error: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Risk analyzer error:', error);
    return NextResponse.json({ 
      error: 'Risk analysis failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/health`);
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Python backend not available',
      status: 'offline' 
    }, { status: 503 });
  }
}