import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import AddToCartButton from '../components/AddToCartButton';
export default async function BookCard({
  id,
  title,
  author,
  price,
  imageUri,
  type,
  ownerId,
  status,
}) {
  const session = await getServerSession(authOptions);
  const isExchange = type === 'exchange';
  const isOwner = String(ownerId) === session?.user?.id;
  const STAMP_CLASS = {
    open: 'text-green-700 border-green-700',
    pending: 'text-yellow-700 border-yellow-700',
    closed: 'text-red-600 border-red-600',
  };
  return (
    <div className="w-full sm:min-w-60 max-w-75">
      <div className="group flex flex-col bg-white rounded-lg border border-line overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
        <Link href={`/books-items/${id}`}>
          <div className="relative h-[280px] overflow-hidden flex items-center justify-center">
            {/* Blurred background */}
            <img
              src={imageUri}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
            />

            {/* Dark overlay for a clean look */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Actual book cover */}
            <img
              src={imageUri}
              alt={title}
              className="relative z-10 w-full h-full object-contain"
            />
          </div>

          <div className="p-3.5 flex flex-col gap-1.5 flex-1">
            <div className="pt-3.5">
              <span
                className={`stamp ${
                  STAMP_CLASS[status] || 'text-gray-500 border-gray-500'
                }`}
              >
                {isExchange ? 'For Exchange' : 'New'}
              </span>
            </div>
            <h3 className="font-display font-semibold text-[15px] truncate">
              {title}
            </h3>

            <p className="text-muted text-[12.5px]">{author}</p>
          </div>
        </Link>

        <div className="p-3.5 pt-0 flex items-center justify-between mt-auto">
          <span className="font-mono font-semibold text-spine text-[13.5px]">
            {isExchange ? 'Swap' : `$${Number(price || 0).toFixed(2)}`}
          </span>

          {isOwner ? (
            <Link
              href={`/editListing/${id}`}
              className="bg-spine hover:bg-spine-dark text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              Edit
            </Link>
          ) : isExchange ? (
            <button
              type="button"
              className="bg-spine hover:bg-spine-dark text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              Request
            </button>
          ) : (
            <AddToCartButton bookId={id} />
          )}
        </div>
      </div>
    </div>
  );
}
