import { NextResponse } from 'next/server';

let donors = [
  {
    id: 1,
    name: "John Doe",
    bloodGroup: "O+",
    age: 28,
    weight: 70,
    phone: "+91 9876543210",
    email: "john@example.com",
    lastDonation: "2024-06-15",
    status: "Available"
  },
  {
    id: 2,
    name: "Jane Smith",
    bloodGroup: "A+",
    age: 32,
    weight: 55,
    phone: "+91 9876543211",
    email: "jane@example.com",
    lastDonation: "2024-05-20",
    status: "Available"
  }
];

export async function GET() {
  try {
    return NextResponse.json({ donors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, bloodGroup, age, weight, phone, email, lastDonation, medicalHistory } = await request.json();
    
    const newDonor = {
      id: Date.now(),
      name,
      bloodGroup,
      age: parseInt(age),
      weight: parseInt(weight),
      phone,
      email,
      lastDonation,
      medicalHistory,
      status: "Available"
    };

    donors.push(newDonor);

    return NextResponse.json({ 
      success: true,
      donor: newDonor,
      message: 'Donor registered successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register donor' }, { status: 500 });
  }
}