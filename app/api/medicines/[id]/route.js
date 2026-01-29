import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    return NextResponse.json({ 
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, dosage, frequency, startDate, endDate, doctorName } = await request.json();
    
    const updatedMedicine = {
      id: parseInt(id),
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      doctorName
    };

    return NextResponse.json({ 
      success: true,
      medicine: updatedMedicine,
      message: 'Medicine updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}