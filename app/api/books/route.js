import connectDB from '../../services/database/mongodb';
import Book from '../../models/booklisting';

import { getServerSession } from 'next-auth';
import connectDB from '../../services/database/mongodb';
import Book from '../../models/booklisting';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // ownerId must come from the session, never from the client
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      author,
      description,
      price,
      coverImageUrl,
      coverImagePublicId,
      stock,
      genre,
      type,
      wantedInReturn,
    } = await request.json();

    if (!title || !description || !coverImageUrl || price === undefined) {
      return Response.json(
        { error: 'Missing required field.' },
        { status: 400 }
      );
    }

    if (!['new', 'exchange'].includes(type)) {
      return Response.json(
        { error: 'Type must be "new" or "exchange".' },
        { status: 400 }
      );
    }

    await connectDB();

    const newListing = await Book.create({
      title,
      author,
      description,
      price,
      coverImageUrl,
      coverImagePublicId,
      stock,
      genre,
      type,
      wantedInReturn,
      ownerId: session.user.id,
    });

    return Response.json(
      {
        message: 'Book listed successfully!',
        book: newListing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Listing Error:', error);

    return Response.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      title,
      author,
      description,
      price,
      coverImageUrl,
      coverImagePublicId,
      stock,
      genre,
      type,
      ownerId,
      wantedInReturn
    } = await request.json();

    if (!title || !description || !coverImageUrl || price === undefined) {
      return Response.json(
        { error: "Missing required field." },
        { status: 400 }
      );
    }
console.log(wantedInReturn)
    await connectDB();

    const newListing = await Book.create({
      title,
      author,
      description,
      price,
      coverImageUrl,
      coverImagePublicId,
      stock,
      genre,
      type,
      wantedInReturn,
      ownerId,
      
    });

    return Response.json(
      {
        message: "Book listed successfully!",
        book: newListing,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Listing Error:", error);

    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
