import { NextResponse } from 'next/server';
import { getBooks } from '../../../lib/books';

export async function GET() {
  try {
    const books = await getBooks();

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}