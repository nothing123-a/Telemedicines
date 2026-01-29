import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Medicine from "@/models/Medicine";

export async function GET() {
  try {
    await connectDB();
    console.log('Database connected for GET');
    
    const medicines = await Medicine.find({});
    console.log('Found medicines:', medicines.length);
    
    return NextResponse.json({ medicines }, { status: 200 });
  } catch (error) {
    console.error("Get medicines error:", error);
    return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('POST request body:', body);
    
    const { name, category, price, stock, description, manufacturer, expiryDate, stockStatus, restockDate, pharmacistId, pharmacyName } = body;

    if (!name || !category) {
      return NextResponse.json({ message: "Name and category are required" }, { status: 400 });
    }

    await connectDB();
    console.log('Database connected for POST');

    const newMedicine = new Medicine({
      name,
      category,
      price: price || 0,
      stock: stock || 0,
      description: description || '',
      manufacturer,
      expiryDate: expiryDate || '',
      stockStatus: stockStatus || "in-stock",
      restockDate: restockDate || '',
      pharmacistId: pharmacistId || 'temp_id',
      pharmacyName: pharmacyName || 'Test Pharmacy'
    });

    console.log('Saving medicine:', newMedicine);
    const savedMedicine = await newMedicine.save();
    console.log('Medicine saved:', savedMedicine);

    return NextResponse.json(
      { message: "Medicine added successfully", medicine: savedMedicine },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add medicine error:", error);
    return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('PUT request body:', body);
    
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ message: "Medicine ID required" }, { status: 400 });
    }

    await connectDB();
    console.log('Database connected for PUT');

    const updatedMedicine = await Medicine.findByIdAndUpdate(id, updateData, { new: true });
    console.log('Medicine updated:', updatedMedicine);

    if (!updatedMedicine) {
      return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Medicine updated successfully", medicine: updatedMedicine },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update medicine error:", error);
    return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('DELETE request for ID:', id);

    if (!id) {
      return NextResponse.json({ message: "Medicine ID required" }, { status: 400 });
    }

    await connectDB();
    console.log('Database connected for DELETE');

    const deletedMedicine = await Medicine.findByIdAndDelete(id);
    console.log('Medicine deleted:', deletedMedicine);

    if (!deletedMedicine) {
      return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Medicine deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete medicine error:", error);
    return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}