"use client"
import React, { useState } from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { signOut } from '@/lib/supabase';

const Navbar = () => {

  const { isSeller, router, userData, user } = useAppContext();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSignedIn = !!user;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchBar(false);
    }
  };

  const handleSearchIconClick = () => {
    setShowSearchBar(!showSearchBar);
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image 
        className="w-28 md:w-32 cursor-pointer" 
        src={assets.logo} 
        alt="TechStore logo"
        onClick={() => router.push('/')}
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          Contact
        </Link>

        {isSeller && <button onClick={() => router.push('/admin-login')} className="text-xs border px-4 py-1.5 rounded-full">Admin Login</button>}

      </div>

      <ul className="hidden md:flex items-center gap-4 ">
        {showSearchBar ? (
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-primary-500"
              autoFocus
            />
            <button type="submit" className="text-primary-500 hover:text-primary-600">
              <Image className="w-4 h-4" src={assets.search_icon} alt="search" width={16} height={16} />
            </button>
            <button 
              type="button" 
              onClick={() => setShowSearchBar(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </form>
        ) : (
          <button onClick={handleSearchIconClick}>
            <Image className="w-4 h-4 cursor-pointer hover:opacity-70" src={assets.search_icon} alt="search icon" width={16} height={16} />
          </button>
        )}
        <Link href="/cart" className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.cart_icon} alt="cart icon" className="w-6 h-6" width={24} height={24} />
          Cart
        </Link>
        {hasSupabaseKeys ? (
          isSignedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 hover:text-gray-900 transition"
              >
                {userData?.imageUrl ? (
                  <Image 
                    src={userData.imageUrl} 
                    alt="Profile" 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                ) : (
                  <Image src={assets.user_icon} alt="user icon" className="w-8 h-8" width={32} height={32} />
                )}
                Account
              </button>
              
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <Link 
                      href="/user-profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/my-orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      My Orders
                    </Link>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setShowAccountMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/sign-in"
                className="flex items-center gap-2 hover:text-gray-900 transition"
              >
                <Image src={assets.user_icon} alt="user icon" width={32} height={32} />
                Sign In
              </Link>
              <Link 
                href="/sign-up"
                className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm hover:bg-primary-600 transition"
              >
                Sign Up
              </Link>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 hover:text-gray-900 transition opacity-50 cursor-not-allowed">
              <Image src={assets.user_icon} alt="user icon" className="w-8 h-8" width={32} height={32} />
              Account (Setup Required)
            </button>
          </div>
        )}
      </ul>

      {/* Mobile Search Bar */}
      <div className="md:hidden w-full px-6 py-3 border-t border-gray-200">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-primary-500"
          />
        </form>
      </div>

      <div className="flex items-center md:hidden gap-3">
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}
        <Link href="/cart" className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.cart_icon} alt="cart icon" className="w-6 h-6" width={24} height={24} />
        </Link>
        {hasSupabaseKeys ? (
           isSignedIn ? (
             <div className="relative">
               <button 
                 onClick={() => setShowAccountMenu(!showAccountMenu)}
                 className="flex items-center gap-2 hover:text-gray-900 transition"
               >
                 {userData?.imageUrl ? (
                   <Image 
                     src={userData.imageUrl} 
                     alt="Profile" 
                     width={32} 
                     height={32} 
                     className="rounded-full"
                   />
                 ) : (
                   <Image src={assets.user_icon} alt="user icon" className="w-8 h-8" width={32} height={32} />
                 )}
               </button>
               
               {showAccountMenu && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                   <div className="py-1">
                     <Link 
                       href="/user-profile" 
                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                       onClick={() => setShowAccountMenu(false)}
                     >
                       Profile
                     </Link>
                     <Link 
                       href="/my-orders" 
                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                       onClick={() => setShowAccountMenu(false)}
                     >
                       My Orders
                     </Link>
                     <button 
                       onClick={() => {
                         handleSignOut();
                         setShowAccountMenu(false);
                       }}
                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       Sign Out
                     </button>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="flex items-center gap-2">
               <Link 
                 href="/sign-in"
                 className="flex items-center gap-2 hover:text-gray-900 transition"
               >
                 <Image src={assets.user_icon} alt="user icon" width={32} height={32} />
               </Link>
             </div>
           )
         ) : (
           <button className="flex items-center gap-2 hover:text-gray-900 transition opacity-50 cursor-not-allowed">
             <Image src={assets.user_icon} alt="user icon" width={32} height={32} />
           </button>
         )}
      </div>
    </nav>
  );
};

export default Navbar;