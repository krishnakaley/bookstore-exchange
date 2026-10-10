'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

import Link from 'next/link';

const STAMP_CLASS = {
  open: 'stamp-open',
  pending: 'stamp-pending',
  closed: 'stamp-closed',
};

export default function MyListingsPage() {
  const { status } = useSession();
  const [listings, setListings] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetch('/api/mybooks');
        const data = await res.json();
        setListings(res.ok ? data : []);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') loadListings();
  }, [status]);

  async function handleDelete(id) {
    const confirmed = confirm('Delete this listing?');

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/mybooks/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete listing');
        return;
      }

      // Remove deleted book from UI
      setListings((prev) => prev.filter((listing) => listing._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong while deleting the listing.');
    }
  }

  if (status !== 'authenticated' || loading) {
    return (
      <div className="wrap px-4 py-16 text-center text-sm text-muted">
        Loading…
      </div>
    );
  }
  async function handleStatusChange(id, newStatus) {
    try {
      const response = await fetch(`/api/mybooks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to update status');
        return;
      }

      setListings((prev) =>
        prev.map((listing) =>
          listing._id === id ? { ...listing, status: newStatus } : listing
        )
      );
    } catch (error) {
      console.error('Status update error:', error);
      alert('Something went wrong while updating the status.');
    }
  }

  return (
    <div className="max-w-[1120px] w-full mx-auto px-6 pt-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl">My Listings</h1>
        </div>
        <Link
          href="/newListing"
          className="bg-spine  hover:bg-spine-dark text-white font-semibold text-sm
                     rounded-md px-4 py-2.5 transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="text-sm text-muted">
          You haven&apos;t listed any books yet.
        </p>
      ) : (
        <div className="bg-paper-white border border-line rounded-card divide-y divide-line">
          {listings.map((listing) => (
            <div key={listing._id} className="flex items-center gap-4 p-4">
              <div
                className="w-14 h-18 rounded-md bg-paper-2 border border-line flex items-center
                              justify-center text-xs text-muted font-mono shrink-0"
              >
                <img
                  className="w-full h-full object-cover"
                  src={listing.coverImageUrl}
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink truncate">
                  {listing.title}
                </div>
              <select
                value={listing.status}
                onChange={(e) =>
                  handleStatusChange(listing._id, e.target.value)
                }
                className={`stamp ${STAMP_CLASS[listing.status] || 'stamp-open'} mt-1`}
              >
                <option value="open">open</option>
                <option value="pending">pending</option>
                <option value="closed">closed</option>
              </select>
              </div> 
              <Link
                href={`/books-items/${listing._id}`}
                className="border border-line rounded-md px-3 py-1.5 text-xs font-semibold text-ink
                           hover:bg-paper-2 transition-colors shrink-0"
              >
                View
              </Link>
              <Link
                href={`/editListing/${listing._id}`}
                className="border border-line rounded-md px-3 py-1.5 text-xs font-semibold text-ink
                           hover:bg-paper-2 transition-colors shrink-0"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(listing._id)}
                className="border border-danger/40 text-danger rounded-md px-3 py-1.5 text-xs
                           font-semibold hover:bg-danger/10 transition-colors shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
