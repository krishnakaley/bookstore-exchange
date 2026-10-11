import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '../../services/database/mongodb';
import Book from '../../models/booklisting';
import Cart from '../../models/cart';


async function getUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session.user.id;
}

// GET: Fetch the logged-in user's cart
export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: 'Please log in first.' },
        { status: 401 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({ userId })
      .populate('items.bookId')
      .lean();

    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error('Fetch cart error:', error);

    return NextResponse.json(
      { message: 'Failed to fetch cart.' },
      { status: 500 }
    );
  }
}

// POST: Add a book to the cart
export async function POST(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: 'Please log in first.' },
        { status: 401 }
      );
    }

    const { bookId, quantity = 1 } = await request.json();

    if (
      !mongoose.Types.ObjectId.isValid(bookId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        { message: 'Invalid book or quantity.' },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findById(bookId);

    if (!book || book.type !== 'new') {
      return NextResponse.json(
        { message: 'Only available new books can be added to the cart.' },
        { status: 400 }
      );
    }

    if (book.stock < quantity) {
      return NextResponse.json(
        { message: 'Not enough stock available.' },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.bookId.toString() === bookId
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > book.stock) {
      return NextResponse.json(
        { message: 'Requested quantity exceeds available stock.' },
        { status: 400 }
      );
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ bookId, quantity });
    }

    await cart.save();

    return NextResponse.json(
      { message: 'Book added to cart.', cart },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);

    return NextResponse.json(
      { message: 'Failed to add book to cart.' },
      { status: 500 }
    );
  }
}

// PATCH: Update an item's quantity
export async function PATCH(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: 'Please log in first.' },
        { status: 401 }
      );
    }

    const { bookId, quantity } = await request.json();

    if (
      !mongoose.Types.ObjectId.isValid(bookId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        { message: 'Invalid book or quantity.' },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findById(bookId);

    if (!book || book.type !== 'new' || quantity > book.stock) {
      return NextResponse.json(
        { message: 'Requested quantity is not available.' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json(
        { message: 'Cart not found.' },
        { status: 404 }
      );
    }

    const item = cart.items.find(
      (entry) => entry.bookId.toString() === bookId
    );

    if (!item) {
      return NextResponse.json(
        { message: 'Book not found in cart.' },
        { status: 404 }
      );
    }

    item.quantity = quantity;
    await cart.save();

    return NextResponse.json({ message: 'Quantity updated.', cart });
  } catch (error) {
    console.error('Update cart error:', error);

    return NextResponse.json(
      { message: 'Failed to update cart.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a book from the cart
export async function DELETE(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: 'Please log in first.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!mongoose.Types.ObjectId.isValid(bookId || '')) {
      return NextResponse.json(
        { message: 'Invalid book ID.' },
        { status: 400 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    cart.items = cart.items.filter(
      (item) => item.bookId.toString() !== bookId
    );

    await cart.save();

    return NextResponse.json({
      message: 'Book removed from cart.',
      cart,
    });
  } catch (error) {
    console.error('Remove cart item error:', error);

    return NextResponse.json(
      { message: 'Failed to remove book.' },
      { status: 500 }
    );
  }
}