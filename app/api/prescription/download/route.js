import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DrPrescription from "@/models/DrPrescription";

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get("id");
    
    if (!prescriptionId) {
      return NextResponse.json({ error: "Prescription ID required" }, { status: 400 });
    }

    const prescription = await DrPrescription.findById(prescriptionId);
    
    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Generate PDF content as HTML
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Digital Prescription</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            font-size: 18px; 
            line-height: 1.8; 
            margin: 40px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 30px; 
            margin-bottom: 40px; 
          }
          .title { 
            font-size: 36px; 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 10px; 
          }
          .subtitle { 
            font-size: 20px; 
            color: #64748b; 
          }
          .section { 
            margin-bottom: 40px; 
            padding: 25px; 
            background: #f8fafc; 
            border-radius: 12px; 
            border-left: 6px solid #3b82f6; 
          }
          .section-title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 20px; 
          }
          .medicine { 
            background: white; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            border: 2px solid #e2e8f0; 
          }
          .medicine-name { 
            font-size: 22px; 
            font-weight: bold; 
            color: #0f172a; 
            margin-bottom: 10px; 
          }
          .medicine-details { 
            font-size: 18px; 
            color: #475569; 
            line-height: 1.6; 
          }
          .instructions { 
            background: #fef3c7; 
            padding: 25px; 
            border-radius: 12px; 
            border: 2px solid #f59e0b; 
            font-size: 18px; 
            line-height: 1.8; 
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            font-size: 16px; 
            color: #64748b; 
            border-top: 2px solid #e2e8f0; 
            padding-top: 30px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🏥 DIGITAL PRESCRIPTION</div>
          <div class="subtitle">Clarity Care Healthcare Platform</div>
        </div>

        <div class="section">
          <div class="section-title">👨‍⚕️ Doctor Information</div>
          <p><strong>Doctor:</strong> ${prescription.doctorName || 'Dr. Unknown'}</p>
          <p><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(prescription.createdAt).toLocaleTimeString()}</p>
          <p><strong>Prescription ID:</strong> ${prescription._id.toString().slice(-8)}</p>
        </div>

        <div class="section">
          <div class="section-title">💊 Prescribed Medicines</div>
          ${prescription.medicines.map(medicine => `
            <div class="medicine">
              <div class="medicine-name">📋 ${medicine.name}</div>
              <div class="medicine-details">
                <p><strong>Dosage:</strong> ${medicine.dosage || 'As directed'}</p>
                <p><strong>Frequency:</strong> ${medicine.frequency || 'As directed'}</p>
                <p><strong>Duration:</strong> ${medicine.duration || 'As directed'}</p>
              </div>
            </div>
          `).join('')}
        </div>

        ${prescription.instructions ? `
          <div class="section">
            <div class="section-title">📝 Doctor's Instructions</div>
            <div class="instructions">
              ${prescription.instructions}
            </div>
          </div>
        ` : ''}

        <div class="footer">
          <p>🔒 This is a digitally generated prescription from Clarity Care</p>
          <p>📞 For any queries, contact your healthcare provider</p>
          <p>⚠️ Please follow the prescribed dosage and consult your doctor before making any changes</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="prescription-${prescription._id.toString().slice(-8)}.html"`
      }
    });

  } catch (error) {
    console.error("Error generating prescription PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}