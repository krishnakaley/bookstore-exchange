
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

import connectDB from '../../../services/database/mongodb';
import User from '../../../models/User';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_ID
);

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { message: 'Google ID token is required' },
        { status: 400 }
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json(
        { message: 'Google email is not verified' },
        { status: 401 }
      );
    }

    await connectDB();

    let user = await User.findOne({
      email: payload.email.toLowerCase(),
    });

    if (!user) {
      user = await User.create({
        name: payload.name || 'BookSwap User',
        email: payload.email.toLowerCase(),
        image: payload.picture || '',

      });
    }

   
    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'bookswap-api',
      }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image || '',
      },
    });
  } catch (error) {
    console.error('Google login error:', error);

    return NextResponse.json(
      { message: 'Google login failed' },
      { status: 401 }
    );
  }
}
