'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const Layout = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        // Check localStorage for admin session
        const adminLoggedIn = localStorage.getItem('adminLoggedIn')
        const adminEmail = localStorage.getItem('adminEmail')
        
        if (adminLoggedIn === 'true' && adminEmail === 'admin@lekzzy.com') {
          setIsAdmin(true)
        } else {
          // Redirect to admin login if not authenticated
          router.push('/admin-login')
          return
        }
      } catch (error) {
        console.error('Admin check error:', error)
        router.push('/admin-login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout