import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function BookCard({
  id,
  title,
  author,
  price,
  imageUri,
  type,
  ownerId,
}) {
  const session = await getServerSession(authOptions);
  const isExchange = type === 'exchange';
  const isOwner = String(ownerId) === session?.user?.id;

  return (
    <div className="w-full sm:min-w-60 max-w-75">
      <div className="group flex flex-col bg-white rounded-lg border border-line overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
        <Link href={`/books-items/${id}`}>
          <div className="h-[280px]  overflow-hidden">
            <img
              src={imageUri}
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="p-3.5 flex flex-col gap-1.5">
            <span
              className={`stamp ${
                isExchange ? 'stamp-exchange' : 'stamp-new'
              } self-start`}
            >
              {isExchange ? 'For Exchange' : 'New'}
            </span>

            <h3 className="font-display font-semibold text-[15px] truncate">
              {title}
            </h3>

            <p className="text-muted text-[12.5px]">
              {author}
            </p>
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
          ) : (
            <Link
              href={`/books-items/${id}`}
              className="bg-spine hover:bg-spine-dark text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              {isExchange ? 'Request' : 'Add to Cart'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
