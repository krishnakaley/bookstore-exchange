'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import FormInput from '../components/books/FormInput';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ListingForm from '../components/books/ListingForm';

export default function NewListingForm() {
return <ListingForm />
}
