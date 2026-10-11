import Link from 'next/link';
import BookCard from '../components/BookCard';
import { getBooks } from '../lib/books';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function BookItems({ searchParams }) {
  const params = await searchParams;
  const search = params.search || '';
  const books = await getBooks(search);
  const session = await getServerSession(authOptions);

  return (
    <>
      {/* ---------- All Available Books ---------- */}
      <section className="max-w-[1120px] w-full mx-auto px-6 p-10 ">
        {/* Search Bar */}
        <form
          method="GET"
          action="/books-items"
          className="max-w-[500px] mx-auto mb-10"
        >
          <div className="flex">
            <input
              type="text"
              name="search"
              defaultValue=""
              placeholder="Search books..."
              className="flex-1 h-11 border border-gray-400 px-4 text-sm outline-none focus:border-gray-700 rounded-l-md"
            />

            <button
              type="submit"
              className="bg-spine hover:bg-spine-dark text-white px-6 rounded-r-md text-sm font-semibold"
            >
              Search
            </button>
          </div>
        </form>

        {books.length === 0 ? (
          <div className="text-center py-12 border border-line rounded-lg bg-white">
            <h3 className="font-display text-lg font-semibold mb-2">
              No books available yet
            </h3>

            <p className="text-muted text-sm mb-5">
              Be the first to list a book and help grow our community.
            </p>

            <Link
              href={session ? '/newListing' : '/login'}
              className="inline-block bg-spine hover:bg-spine-dark text-white rounded-md px-5 py-3 text-sm font-semibold transition-colors"
            >
              List a Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-15 gap-y-8 justify-items-center">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                imageUri={book.coverImageUrl}
                type={book.type}
                WantedInReturn={book.wantedInReturn || null}
                status={book.status}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
