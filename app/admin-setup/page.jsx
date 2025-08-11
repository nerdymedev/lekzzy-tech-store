'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

const AdminSetup = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSetAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // This is a simple client-side setup for demonstration
      // In production, you would want this to be a server-side API route
      // with proper authentication and authorization
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to use this feature')
        return
      }

      // Check if current user is already an admin
      const adminEmails = ['admin@lekzzy.com', 'seller@lekzzy.com']
      const isCurrentUserAdmin = adminEmails.includes(user.email) || user.user_metadata?.role === 'admin'
      
      if (!isCurrentUserAdmin) {
        setError('Only existing admins can set up new admins')
        return
      }

      setMessage(`Note: This is a demo setup page. In production, admin role assignment should be done through Supabase dashboard or server-side API. Email ${email} should be manually configured as admin in Supabase Auth settings.`)
      
    } catch (error) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Configure admin access for users
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-yellow-800">Current Admin Emails:</h3>
          <ul className="mt-2 text-sm text-yellow-700">
            <li>• admin@lekzzy.com</li>
            <li>• seller@lekzzy.com</li>
          </ul>
          <p className="mt-2 text-xs text-yellow-600">
            These emails have admin access by default. To add more admins, update the adminEmails array in the code.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSetAdmin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              User Email to Grant Admin Access
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="text-blue-600 text-sm">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Setup Admin Access'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <a href="/admin-login" className="text-indigo-600 hover:text-indigo-500">
            Go to Admin Login
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminSetup