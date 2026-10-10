'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import FormInput from './FormInput';

export default function ListingForm({ book = null }) {
  const isEdit = Boolean(book);

  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    price: book?.price ?? '',
    stock: book?.stock ?? '',
    genre: book?.genre || '',
    type: book?.type || '',
    status: book?.status || '',
    wantedInReturn: book?.wantedInReturn || '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(
    book?.coverImageUrl || ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function handleBookCover(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setCoverImage(file);
    setCoverImagePreview(URL.createObjectURL(file));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!session?.user?.id) {
        throw new Error('Please log in before submitting.');
      }

    
      let coverImageUrl = book?.coverImageUrl || '';
      let coverImagePublicId = book?.coverImagePublicId || '';

      if (coverImage) {
        const imageFormData = new FormData();

        imageFormData.append('file', coverImage);
        imageFormData.append(
          'upload_preset',
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );
        imageFormData.append(
          'folder',
          `Bookswap/Book/${session.user.name}/${session.user.id}`
        );

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: imageFormData,
          }
        );

        const cloudinaryData = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok) {
          throw new Error(
            cloudinaryData.error?.message || 'Image upload failed.'
          );
        }

        coverImageUrl = cloudinaryData.secure_url;
        coverImagePublicId = cloudinaryData.public_id;
      }

      const response = await fetch(
        isEdit ? `/api/mybooks/${book._id}` : '/api/books',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            author: formData.author,
            description: formData.description,
            price: Number(formData.price || 0),
            coverImageUrl,
            coverImagePublicId,
            stock: Number(formData.stock || 0),
            genre: formData.genre,
            type: formData.type,
            status:formData.status,
            wantedInReturn: formData.wantedInReturn,
            ownerId: session.user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isEdit ? 'Failed to update listing.' : 'Failed to list book.')
        );
      }

      setSuccess(
        isEdit ? 'Book updated successfully!' : 'Book listed successfully!'
      );

      if (isEdit) {
        router.push('/account/profile/myListings');
      } else {
        setFormData({
          title: '',
          author: '',
          description: '',
          price: '',
          stock: '',
          genre: '',
          type: '',
          wantedInReturn: '',
        });

        setCoverImage(null);
        setCoverImagePreview('');
        router.push('/');
      }

      router.refresh();
    } catch (error) {
      setError(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {' '}
      <h2 className="text-center p-5 text-4xl">
        {isEdit ? 'Edit Your Book' : 'List Your Book'}{' '}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[530px] mx-auto px-4 sm:px-0"
      >
        <>
          <FormInput
            id="title"
            name="title"
            label="TITLE"
            value={formData.title}
            onChange={handleChange}
          />
          <FormInput
            id="author"
            name="author"
            label="AUTHOR"
            value={formData.author}
            onChange={handleChange}
          />
          <FormInput
            id="genre"
            name="genre"
            label="GENRE"
            value={formData.genre}
            onChange={handleChange}
            placeholder="e.g. Fiction, Romance, Mystery"
          />
          <div className="mb-5">
            <label
              htmlFor="description"
              className="block text-xs font-medium text-gray-700 mb-2"
            >
              DESCRIPTION
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-400 px-3 py-2 text-sm resize-none outline-none focus:border-gray-700"
            />
          </div>
        

         {isEdit?<div className="relative mb-5">
            <label
              htmlFor="status"
              className="block text-xs font-medium text-gray-700 mb-2"
            >
              SELECT STATUS
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full h-9 border border-gray-400 px-3 text-sm bg-white outline-none focus:border-gray-700"
            >
              <option value="">Select</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>:<div></div>} 
            <div className="relative mb-5">
            <label
              htmlFor="type"
              className="block text-xs font-medium text-gray-700 mb-2"
            >
              SELECT TYPE
            </label>

            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full h-9 border border-gray-400 px-3 text-sm bg-white outline-none focus:border-gray-700"
            >
              <option value="">Select</option>
              <option value="new">New</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>
        </>

        {formData.type === 'new' && (
          <>
            <FormInput
              id="price"
              name="price"
              label="PRICE"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
            />

            <FormInput
              id="stock"
              name="stock"
              label="STOCK"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
            />
          </>
        )}

        {formData.type === 'exchange' && (
          <FormInput
            id="wantedInReturn"
            name="wantedInReturn"
            label="WANTED IN RETURN (OPTIONAL)"
            value={formData.wantedInReturn}
            onChange={handleChange}
          />
        )}

        <>
          <label
            htmlFor="book-cover"
            className="mb-5 flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 overflow-hidden"
          >
            {coverImagePreview ? (
              <img
                src={coverImagePreview}
                alt="Book cover preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-gray-500 text-center px-3">
                No image selected — Click to upload
              </span>
            )}
          </label>
          <input
            id="book-cover"
            type="file"
            accept="image/*"
            onChange={handleBookCover}
            className="hidden"
          />
        </>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {success && <p className="mb-4 text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mb-8 w-full h-11 border border-gray-500 bg-gray-100 text-sm text-[#155b87] hover:bg-gray-200 disabled:opacity-50"
        >
          {loading
            ? isEdit
              ? 'Updating...'
              : 'Publishing...'
            : isEdit
              ? 'Update Listing'
              : 'Publish Listing'}
        </button>
      </form>
    </>
  );
}
