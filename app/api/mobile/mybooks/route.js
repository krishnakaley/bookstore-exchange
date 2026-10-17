import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../services/database/mongodb';
import Books from '../../../models/booklisting';

export async function GET(request) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.startsWith('Bearer ')
      ? auth.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { message: 'Login required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'bookswap-api',
    });

    await connectDB();

    const books = await Books.find({
      ownerId: decoded.sub,
    }).lean();

    return NextResponse.json({
      success: true,
      books: books.map(book => ({
        ...book,
        id: book._id.toString(),
      })),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: 'Invalid token or failed to fetch books' },
      { status: 401 }
    );
  }
}