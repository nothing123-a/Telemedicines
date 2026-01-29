import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const medicines = [
      {
        id: 1,
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        doctorName: "Dr. Sharma"
      },
      {
        id: 2,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: "2024-02-01",
        endDate: "",
        doctorName: "Dr. Patel"
      }
    ];

    return NextResponse.json({ medicines });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, dosage, frequency, startDate, endDate, doctorName } = await request.json();
    
    const newMedicine = {
      id: Date.now(),
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      doctorName
    };

    return NextResponse.json({ 
      success: true,
      medicine: newMedicine,
      message: 'Medicine added successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add medicine' }, { status: 500 });
  }
}