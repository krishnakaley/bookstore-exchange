'use client';

import { useState } from 'react';

export default function AddToCartButton({ bookId }) {
  const [loading, setLoading] = useState(false);

  async function addToCart() {
    try {
      setLoading(true);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Could not add book to cart.');
        return;
      }

      window.dispatchEvent(new Event('cartUpdated'));
      alert('Book added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      disabled={loading}
      className="bg-spine hover:bg-spine-dark text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
    >
      {loading ? 'Adding...' : 'Add to cart'}
    </button>
  );
}
