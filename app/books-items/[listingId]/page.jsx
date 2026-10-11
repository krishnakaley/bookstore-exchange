import { notFound } from 'next/navigation';
import { getBookDetails } from '../../lib/books';

export default async function BookDetailsPage({ params }) {
  const { listingId } = await params;

  const book = await getBookDetails({
    id: listingId,
  });

  if (!book) {
    notFound();
  }
  const STAMP_CLASS = {
    open: 'stamp-open',
    pending: 'stamp-pending',
    closed: 'stamp-closed',
  };
  return (
    <div className="max-w-[1120px] w-full mx-auto px-6 md:px-10 lg:px-12 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative aspect-[2/3] h-[500px] flex items-center justify-center overflow-hidden">
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="max-w-full max-h-full object-contain"
          />

          {/* Slanted Status Ribbon */}
          <div
            className={`absolute top-6 -right-9 w-36 text-center text-white text-xs font-bold uppercase py-1 rotate-45 shadow-md ${
              {
                open: 'status-ribbon-open',
                pending: 'status-ribbon-pending',
                closed: 'status-ribbon-closed',
              }[book.status] || 'status-ribbon-open'
            }`}
          >
            {book.status || 'open'}
          </div>
        </div>

        {/* Book Information */}
        <div className="flex flex-col">
          {/* Type */}

          <span
            className={`stamp ${
              book.type === 'exchange' ? 'stamp-exchange' : 'stamp-new'
            } self-start`}
          >
            {book.type === 'exchange' ? 'For Exchange' : 'New'}
          </span>

          {/* Title */}
          <h1 className="font-display text-3xl font-semibold mt-4">
            {book.title}
          </h1>

          {/* Author */}
          <p className="text-muted mt-2">by {book.author}</p>

          {/* Genre */}
          <p className="font-bold text-muted mt-4 mb-5">GENRE: {book.genre}</p>

          {/* Description */}
          <h4 className="font-bold">DESCRIPTION</h4>

          <p className="whitespace-pre-line text-gray-700 mt-2 mb-5 leading-7">
            {book.description}
          </p>
          {book.wantedInReturn && (
            <>
              {' '}
              <h4 className="font-bold">WANTED IN RETURN</h4>
              <p className="whitespace-pre-line text-gray-700 mt-2 mb-5 leading-7">
                {book.wantedInReturn}
              </p>
            </>
          )}

          {/* Price / Exchange */}
          <div className="mt-5">
            {book.type === 'exchange' ? (
              <p className="font-semibold text-spine text-xl">
                Available for Exchange
              </p>
            ) : (
              <p className="font-mono font-semibold text-spine text-2xl">
                ${book.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock */}
          {book.wantedInReturn ? (
            <div></div>
          ) : (
            <p className="text- font-bold text-muted mt-3">
              {book.stock > 0 ? `${book.stock} available` : 'Out of stock'}
            </p>
          )}
          {/* Owner */}
          <div className="flex items-center gap-3 mt-6">
            <img
              src={book.ownerId?.image || '/default-avatar.png'}
              alt={book.ownerId?.name || 'Owner'}
              className="w-10 h-10 rounded-full object-cover border border-line"
            />

            <div>
              <p className="text-xs text-muted">Listed by</p>
              <p className="font-semibold text-sm">
                {book.ownerId?.name || 'Unknown user'}
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            disabled={book.stock <= 0 && book.type !== 'exchange'}
            className="mt-6 bg-spine hover:bg-spine-dark disabled:bg-gray-400 text-white font-semibold px-5 py-3 rounded-md transition-colors"
          >
            {book.type === 'exchange' ? 'Request Exchange' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
