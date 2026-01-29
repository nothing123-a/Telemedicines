import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    const type = searchParams.get('type') || 'news';
    
    const categoryQueries = {
      general: 'Punjab healthcare OR Nabha hospital OR Patiala medical OR Punjab health news',
      mental: 'Punjab mental health OR Nabha psychology OR Punjab depression anxiety',
      cardiology: 'Punjab heart disease OR Nabha cardiology OR Punjab cardiac center',
      diabetes: 'Punjab diabetes OR Nabha blood sugar OR Punjab diabetic care',
      cancer: 'Punjab cancer hospital OR Nabha oncology OR Punjab tumor treatment',
      pediatrics: 'Punjab child health OR Nabha pediatrics OR Punjab vaccination',
      neurology: 'Punjab neurology OR Nabha brain center OR Punjab stroke care',
      orthopedics: 'Punjab orthopedics OR Nabha bone hospital OR Punjab joint care',
      dermatology: 'Punjab skin care OR Nabha dermatology OR Punjab skin hospital',
      gynecology: 'Punjab women health OR Nabha gynecology OR Punjab maternity',
      ophthalmology: 'Punjab eye care OR Nabha vision center OR Punjab eye hospital',
      dentistry: 'Punjab dental OR Nabha dentistry OR Punjab oral health',
      nutrition: 'Punjab nutrition OR Nabha diet center OR Punjab healthy eating',
      pharmacy: 'Punjab pharmacy OR Nabha medicines OR Punjab drug store',
      emergency: 'Punjab emergency OR Nabha ambulance OR Punjab trauma center'
    };
    
    const schemes = {
      insurance: 'Punjab Ayushman Bharat OR Nabha PMJAY OR Punjab health insurance OR Sarbat Sehat Bima Yojana Punjab',
      maternal: 'Punjab Janani Suraksha OR Nabha maternal health OR Punjab pregnancy scheme OR Punjab child health program',
      disease: 'Punjab Health Mission OR Nabha disease control OR Punjab TB control OR Punjab malaria control',
      primary: 'Punjab Health Centre OR Nabha primary healthcare OR Punjab preventive healthcare OR Punjab wellness center',
      nutrition: 'Punjab nutrition scheme OR Nabha POSHAN OR Punjab mid day meal OR Punjab ICDS program',
      ayush: 'Punjab AYUSH OR Nabha Ayurveda OR Punjab traditional medicine OR Punjab homeopathy center',
      rural: 'Punjab Rural Health OR Nabha ASHA worker OR Punjab village healthcare OR Punjab rural hospital',
      mental: 'Punjab Mental Health OR Nabha mental health center OR Punjab disability scheme OR Punjab mental health policy'
    };
    
    const query = type === 'schemes' ? schemes[category] : categoryQueries[category];
    
    const response = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": "b15321aee5370f5e506e764fb6141b8fa80c4d0f",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: query,
        num: 15,
        gl: "in"
      })
    });

    const data = await response.json();
    return NextResponse.json(data.news || []);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}