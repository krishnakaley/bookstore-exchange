import { NextResponse } from 'next/server';
import { getFeaturedBooks } from '../../../lib/books';

export async function GET() {
  try {
    const books = await getFeaturedBooks();

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch featured books' },
      { status: 500 }
    );
  }
}