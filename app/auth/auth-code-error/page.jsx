'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect to sign-in after 5 seconds
    const timer = setTimeout(() => {
      router.push('/sign-in')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Authentication Error
              </h2>
              <p className="text-gray-600 mb-6">
                There was an error during the authentication process. This could be due to:
              </p>
              <ul className="text-left text-sm text-gray-500 mb-6 space-y-1">
                <li>• Cancelled authentication</li>
                <li>• Network connection issues</li>
                <li>• Invalid authentication code</li>
                <li>• Session timeout</li>
              </ul>
              <div className="space-y-3">
                <Link
                  href="/sign-in"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go Home
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Redirecting to sign-in page in 5 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}