import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    let user;
    if (session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user && session.user.id) {
      user = await User.findById(session.user.id);
    }
    
    if (!user) {
      return NextResponse.json({
        user: {
          id: session.user.id || 'temp-id',
          name: session.user.name || 'User',
          email: session.user.email || '',
          image: session.user.image || null,
        }
      });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        emergencyNumber: user.emergencyNumber,
        birthdate: user.birthdate,
        gender: user.gender,
        language: user.language,
        email: user.email,
        image: user.image || session.user.image,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, surname, middleName, phoneNumber, emergencyNumber, birthdate, gender, language } = body;

    await dbConnect();
    
    let user;
    if (session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user && session.user.id) {
      user = await User.findById(session.user.id);
    }
    
    if (!user) {
      user = new User({
        email: session.user.email,
        name,
        surname,
        middleName,
        phoneNumber,
        emergencyNumber,
        birthdate,
        gender,
        language,
        image: session.user.image
      });
    } else {
      user.name = name;
      user.surname = surname;
      user.middleName = middleName;
      user.phoneNumber = phoneNumber;
      user.emergencyNumber = emergencyNumber;
      user.birthdate = birthdate;
      user.gender = gender;
      user.language = language;
    }

    await user.save();

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        emergencyNumber: user.emergencyNumber,
        birthdate: user.birthdate,
        gender: user.gender,
        language: user.language,
        email: user.email,
        image: user.image
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}