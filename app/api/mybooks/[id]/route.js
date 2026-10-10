
import connectDB from '../../../services/database/mongodb';
import Book from '../../../models/booklisting';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    console.log("DELETE BOOK ID:", id);

    await connectDB();

    const book = await Book.findById(id);

    if (!book) {
      return Response.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Check owner
    if (book.ownerId.toString() !== session.user.id) {
      return Response.json(
        { error: "You are not allowed to delete this listing" },
        { status: 403 }
      );
    }

    // Delete Cloudinary image
    if (book.coverImagePublicId) {
      await cloudinary.uploader.destroy(book.coverImagePublicId);
    }

    // Delete MongoDB document
    await Book.findByIdAndDelete(id);

    return Response.json({
      message: "Book and image deleted successfully",
    });

  } catch (error) {
    console.error("DELETE listing error:", error);

    return Response.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}


export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const book = await Book.findById(id);

    if (!book) {
      return Response.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Only the owner can update this listing.
    if (book.ownerId.toString() !== session.user.id) {
      return Response.json(
        { error: 'You are not allowed to edit this listing' },
        { status: 403 }
      );
    }

    const allowedTypes = ['new', 'exchange'];
    const allowedStatus = ['open', 'pending','closed'];

    if (
      !body.title?.trim() ||
      !body.author?.trim() ||
      !body.description?.trim() ||
      !allowedTypes.includes(body.type) ||
      !allowedStatus.includes(body.status)
    ) {
      return Response.json(
        { error: 'Please provide all required book details' },
        { status: 400 }
      );
    }

    const oldPublicId = book.coverImagePublicId;

    book.title = body.title.trim();
    book.author = body.author.trim();
    book.description = body.description.trim();
    book.genre = body.genre || '';
    book.type = body.type;
    book.status = body.status;
    book.price = Number(body.price || 0);
    book.stock = Number(body.stock || 0);
    book.wantedInReturn = body.wantedInReturn || '';

    // Keep the existing image if no new image was selected.
    book.coverImageUrl =
      body.coverImageUrl ?? book.coverImageUrl;

    book.coverImagePublicId =
      body.coverImagePublicId ?? book.coverImagePublicId;

    await book.save();

    // Delete the old Cloudinary image only when it was replaced.
    if (
      oldPublicId &&
      book.coverImagePublicId &&
      oldPublicId !== book.coverImagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (imageError) {
        console.error('Old image deletion failed:', imageError);
      }
    }

    return Response.json({
      message: 'Book updated successfully',
      book,
    });
  } catch (error) {
    console.error('UPDATE listing error:', error);

    return Response.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}


export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { status } = await request.json();

    const allowedStatuses = ['open', 'pending', 'closed'];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Status update error:', error);

    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    );
  }
}