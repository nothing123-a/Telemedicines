import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stock = {
      'A+': 25,
      'A-': 8,
      'B+': 18,
      'B-': 5,
      'AB+': 12,
      'AB-': 3,
      'O+': 30,
      'O-': 7
    };

    return NextResponse.json({ stock });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blood stock' }, { status: 500 });
  }
}