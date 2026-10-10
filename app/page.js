import Link from 'next/link';
import BookCard from './components/BookCard';
import { getFeaturedBooks } from './lib/books';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
export default async function Home() {
  const books = await getFeaturedBooks();
  const session = await getServerSession(authOptions);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="text-center px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl font-semibold max-w-xl mx-auto mb-4 leading-tight">
          Buy new books. <em className="text-spine not-italic">Exchange</em> old
          ones.
        </h1>
        <p className="text-muted text-base max-w-md mx-auto mb-6">
          A marketplace for readers — shop new titles or trade the books already
          on your shelf for something new to you.
        </p>

        {books.length > 0 && (
          <div className="flex gap-3 justify-center">
            {session ? (
              <>
                <Link
                  href="/books-items"
                  className="bg-spine hover:bg-spine-dark text-white rounded-md px-5 py-3 text-sm font-semibold transition-colors"
                >
                  Browse Books
                </Link>

                <Link
                  href="/newListing"
                  className="border-2 border-spine text-spine hover:bg-spine hover:text-white rounded-md px-5 py-3 text-sm font-semibold transition-colors"
                >
                  List a Book
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-spine hover:bg-spine-dark text-white rounded-md px-5 py-3 text-sm font-semibold transition-colors"
                >
                  Browse Books
                </Link>

                <Link
                  href="/login"
                  className="border-2 border-spine text-spine hover:bg-spine hover:text-white rounded-md px-5 py-3 text-sm font-semibold transition-colors"
                >
                  List a Book
                </Link>
              </>
            )}
          </div>
        )}
      </section>

      {/* ---------- Featured Books ---------- */}
      <section className="max-w-[1120px] w-full mx-auto px-6 pb-20">
        <h2 className="font-display text-xl font-semibold mb-4">
          Featured Books
        </h2>

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
                ownerId={book.ownerId}

              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
