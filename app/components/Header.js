'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/books-items', label: 'Browse' },
  { href: '/exchange', label: 'Exchange' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const headerRef = useRef(null);
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    if (status !== 'authenticated') {
      setCartCount(0);
      return;
    }

    async function fetchCartCount() {
      try {
        const response = await fetch('/api/cart', {
          cache: 'no-store',
        });

        if (!response.ok) return;

        const data = await response.json();
        setCartCount(data.items?.length ?? 0);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    }

    fetchCartCount();

    window.addEventListener('cartUpdated', fetchCartCount);

    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, [status]);
  useEffect(() => {
    function handleOutsideClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMobileOpen(false);
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="bg-spine text-white sticky top-0 z-40 border-b-[3px] border-spine-dark"
    >
      <div className="max-w-[1120px] mx-auto px-6 py-3.5 flex items-center justify-between gap-5">
        <Link
          href="/"
          className="font-display font-bold text-xl flex items-center gap-2"
        >
          <span className="text-mustard">📖</span> BookSwap
        </Link>

        <nav className="hidden md:flex gap-7 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={closeMenus}
              className={`pb-1  transition-colors ${
                pathname === l.href
                  ? 'text-mustard border-mustard'
                  : 'text-[#E7E1CE] border-transparent hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3.5">
          {status === 'unauthenticated' ? (
            <div></div>
          ) : (
            <Link
              href="/cart"
              onClick={closeMenus}
              className="relative  p-1 text-xl"
              aria-label="Cart"
            >
              🛒
              <span className="absolute -top-1.5 -right-2 bg-mustard text-spine-dark text-[10px] font-bold font-mono rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          )}

          {status === 'authenticated' ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="text-sm font-semibold flex items-center gap-1"
              >
                {session.user.name} ▾
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] bg-white text-ink border border-line rounded-lg min-w-[190px] shadow-lg p-1.5 z-50">
                  <Link
                    href="/account"
                    onClick={closeMenus}
                    className="block px-3 py-2 text-sm rounded hover:bg-paper-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={closeMenus}
                    className="block px-3 py-2 text-sm rounded hover:bg-paper-2"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/profile/myListings"
                    onClick={closeMenus}
                    className="block px-3 py-2 text-sm rounded hover:bg-paper-2"
                  >
                    My Listings
                  </Link>
                  <Link
                    href="/account/profile"
                    onClick={closeMenus}
                    className="block px-3 py-2 text-sm rounded hover:bg-paper-2"
                  >
                    My Requests
                  </Link>
                  <Link
                    href="/account/profile"
                    onClick={closeMenus}
                    className="block px-3 py-2 text-sm rounded hover:bg-paper-2"
                  >
                    Profile
                  </Link>
                  <hr className="my-1 border-line" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="block w-full text-left px-3 py-2 text-sm rounded hover:bg-paper-2"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              onClick={closeMenus}
              className="bg-mustard text-spine-dark rounded-md px-3.5 py-2 text-sm font-semibold hover:bg-mustard-dark transition-colors"
            >
              Log In
            </Link>
          )}

          <button
            className="md:hidden text-2xl leading-none"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-spine-dark px-5 pb-4 pt-2 flex flex-col gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-[#E7E1CE] py-2.5 text-sm border-b border-[#3A5545]"
            >
              {l.label}
            </Link>
          ))}
          {status === 'unauthenticated' && (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-[#E7E1CE] py-2.5 text-sm border-b border-[#3A5545]"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="text-[#E7E1CE] py-2.5 text-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
