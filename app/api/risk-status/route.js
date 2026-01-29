import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { symptoms, severity, duration } = await request.json();
    
    // Simple risk analysis logic
    let riskLevel = 'low';
    let requiresDoctor = false;
    
    const highRiskSymptoms = ['chest pain', 'difficulty breathing', 'severe headache', 'high fever', 'blood'];
    const mediumRiskSymptoms = ['persistent cough', 'fatigue', 'nausea', 'dizziness'];
    
    const symptomsLower = symptoms.toLowerCase();
    
    if (highRiskSymptoms.some(symptom => symptomsLower.includes(symptom)) || severity === 'severe') {
      riskLevel = 'high';
      requiresDoctor = true;
    } else if (mediumRiskSymptoms.some(symptom => symptomsLower.includes(symptom)) || severity === 'moderate') {
      riskLevel = 'medium';
      requiresDoctor = duration > 7;
    }
    
    return NextResponse.json({
      riskLevel,
      requiresDoctor,
      recommendation: requiresDoctor 
        ? 'Please consult with a doctor immediately' 
        : 'Monitor symptoms and rest'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Risk analysis failed' }, { status: 500 });
  }
}