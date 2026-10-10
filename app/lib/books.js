import connectDB from '../services/database/mongodb';
import Books from '../models/booklisting';
import '../models/User';

export async function getFeaturedBooks() {
  await connectDB();

  const books = await Books.aggregate([{ $sample: { size: 8 } }]);

  return books.map((book) => ({
    ...book,
    id: book._id.toString(),
  }));
}
export async function getMyBooks({id}) {
  await connectDB();
  const books = await Books.find({id})

    .lean();

  return books.map((book) => ({
    ...book,
    id: book._id.toString(),
  }));
}
export async function getBooks(search = '') {
  await connectDB();

  console.log("GET BOOKS SEARCH:", search);

  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { genre: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  console.log("MONGO QUERY:", query);

  const books = await Books.find(query).lean();

  console.log("FOUND BOOKS:", books.length);

  return books.map((book) => ({
    ...book,
    id: book._id.toString(),
  }));
}
export async function getBookDetails({ id }) {
  await connectDB();

  const book = await Books.findById(id)
    .populate('ownerId', 'name image')
    .lean();
  return book;
}
