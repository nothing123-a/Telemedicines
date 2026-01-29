import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DrPrescription from "@/models/DrPrescription";

export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get("id");
    
    if (!prescriptionId) {
      return NextResponse.json({ error: "Prescription ID required" }, { status: 400 });
    }

    const deletedPrescription = await DrPrescription.findByIdAndDelete(prescriptionId);
    
    if (!deletedPrescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Prescription deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 });
  }
}