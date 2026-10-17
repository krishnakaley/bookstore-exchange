import { NextResponse } from 'next/server';
import { getBookDetails } from '../../../lib/books';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const book = await getBookDetails({ id });

    if (!book) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      book,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}