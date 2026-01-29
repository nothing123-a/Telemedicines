import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({
        success: false,
        error: "No image provided"
      }, { status: 400 });
    }

    // Forward to prescription reader service
    const prescriptionServiceUrl = process.env.PRESCRIPTION_READER_URL || 'http://localhost:5009';
    
    const serviceFormData = new FormData();
    serviceFormData.append('image', image);

    const response = await fetch(`${prescriptionServiceUrl}/analyze-prescription`, {
      method: 'POST',
      body: serviceFormData
    });

    if (!response.ok) {
      throw new Error(`Prescription service error: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Prescription reader error:', error);
    
    // Fallback analysis if service is down
    return NextResponse.json({
      success: true,
      extracted_text: "Prescription analysis service is currently unavailable. Please try again later.",
      classification: "service unavailable",
      confidence: 0.0,
      is_prescription: false,
      fallback: true
    });
  }
}

export async function GET() {
  try {
    const prescriptionServiceUrl = process.env.PRESCRIPTION_READER_URL || 'http://localhost:5009';
    const response = await fetch(`${prescriptionServiceUrl}/health`);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error('Service unavailable');
    }
  } catch (error) {
    return NextResponse.json({
      status: 'unavailable',
      service: 'prescription-reader',
      error: error.message
    }, { status: 503 });
  }
}