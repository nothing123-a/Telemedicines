import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Mock analysis result based on ID
    const analysis = {
      reportId: id,
      status: 'completed',
      analysis: {
        summary: 'Medical report analysis completed',
        findings: [
          'Blood test parameters reviewed',
          'Vital signs within acceptable range',
          'Some values require monitoring'
        ],
        recommendations: [
          'Continue current medication',
          'Schedule follow-up in 3 months',
          'Maintain healthy diet and exercise'
        ],
        riskLevel: 'Low',
        confidence: 0.85,
        categories: {
          'Blood Work': 'Normal',
          'Vital Signs': 'Good',
          'Overall Health': 'Stable'
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}