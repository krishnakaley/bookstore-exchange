'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    try {
      setError('');

      const response = await fetch('/api/cart', {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load cart.');
      }

      setCart(
        (data.items || [])
          .filter((item) => item.bookId)
          .map((item) => ({
            id: item.bookId._id,
            title: item.bookId.title,
            author: item.bookId.author,
            price: Number(item.bookId.price || 0),
            stock: Number(item.bookId.stock || 0),
            image:
              item.bookId.coverImageUrl ||
              item.bookId.imageUri ||
              '/placeholder.png',
            quantity: item.quantity,
          }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function updateQuantity(bookId, quantity) {
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update quantity.');
      }

      await fetchCart();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(bookId) {
    try {
      const response = await fetch(
        `/api/cart?bookId=${encodeURIComponent(bookId)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not remove book.');
      }
      window.dispatchEvent(new Event('cartUpdated'));

      await fetchCart();
    } catch (err) {
      setError(err.message);
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-paper p-8">
        Loading your cart...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">
          Your Cart
        </h1>

        {error && (
          <p className="mt-4 rounded-md border border-red-300 bg-white p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {cart.length === 0 ? (
          <div className="mt-8 rounded-xl border border-line bg-white p-10 text-center">
            <h2 className="font-display text-xl font-semibold text-ink">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-muted">
              Browse books and add your favorites.
            </p>

            <Link
              href="/books-items"
              className="mt-6 inline-block rounded-md bg-spine px-5 py-3 text-sm font-semibold text-white"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-line bg-white p-4"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-32 w-24 rounded-md object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="truncate font-display text-lg font-semibold text-ink">
                      {item.title}
                    </h2>

                    <p className="text-sm text-muted">{item.author}</p>

                    <p className="mt-2 font-mono font-semibold text-spine">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                      <div className="flex items-center rounded-md border border-line">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1.5 disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center text-sm">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={item.quantity >= item.stock}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-3 py-1.5 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-xl border border-line bg-white p-5">
              <h2 className="font-display text-xl font-semibold text-ink">
                Order Summary
              </h2>

              <div className="mt-5 flex justify-between text-sm text-muted">
                <span>
                  Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold text-ink">
                <span>Total</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError('Checkout has not been implemented yet.')
                }
                className="mt-6 w-full rounded-md bg-spine px-4 py-3 font-semibold text-white hover:opacity-90"
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}