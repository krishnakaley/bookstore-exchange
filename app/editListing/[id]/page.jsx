
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import connectDB from '../../services/database/mongodb';
import Book from '../../models/booklisting';
import ListingForm from '../../components/books/ListingForm';

export default async function EditListingPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;

  try {
    await connectDB();

    const book = await Book.findById(id).lean();

    if (!book) {
      notFound();
    }

    if (book.ownerId.toString() !== session.user.id) {
      notFound();
    }

    const plainBook = JSON.parse(JSON.stringify(book));

    return <ListingForm book={plainBook} />;
  } catch (error) {
    if (error?.digest?.startsWith('NEXT_HTTP_ERROR_FALLBACK;')) {
      throw error;
    }

    notFound();
  }
}