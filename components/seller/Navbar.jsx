import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const Navbar = () => {
  const router = useRouter()

  const handleSignOut = () => {
    // Clear admin session from localStorage
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    router.push('/')
  }

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b'>
      <div onClick={()=>router.push('/')} className='cursor-pointer'>
            <Image className="w-28 md:w-32" src={assets.logo} alt="TechStore logo" width={128} height={32} />
        </div>
      <button 
        onClick={handleSignOut}
        className='bg-primary-500 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-primary-600 transition'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar