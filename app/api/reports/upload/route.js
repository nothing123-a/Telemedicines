import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Forward to Python backend for real analysis
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const response = await fetch('http://localhost:8002/analyze-report', {
      method: 'POST',
      body: pythonFormData,
    });

    if (!response.ok) {
      throw new Error(`Python backend error: ${response.status}`);
    }

    const result = await response.json();
    
    // Generate report ID
    const reportId = Date.now().toString();

    return NextResponse.json({
      success: true,
      reportId,
      filename: result.filename,
      extractedText: result.extracted_text,
      analysis: result.analysis
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed. Make sure Python backend is running on port 8002.',
      details: error.message 
    }, { status: 500 });
  }
}