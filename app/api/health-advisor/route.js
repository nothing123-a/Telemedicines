import { NextResponse } from "next/server";
import HealthAdvisor from "@/lib/healthAdvisor";
import { getServerSession } from "next-auth/next";

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportText } = await req.json();
    
    if (!reportText) {
      return NextResponse.json({ error: "Report text is required" }, { status: 400 });
    }

    const healthAdvisor = new HealthAdvisor();
    const result = await healthAdvisor.processHealthReport(reportText);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Health advisor error:", error);
    return NextResponse.json(
      { error: "Failed to process health report" },
      { status: 500 }
    );
  }
}