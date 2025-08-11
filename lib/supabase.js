import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null

// Auth helper functions
export const signUp = async (email, password, userData = {}) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) {
    return { error: { message: 'Supabase not configured' } }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!supabase) {
    return { user: null, error: { message: 'Supabase not configured' } }
  }
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const updateUserProfile = async (updates) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })
  return { data, error }
}

export const signInWithGoogle = async (redirectTo = '/') => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      scopes: 'https://www.googleapis.com/auth/userinfo.email'
    }
  })
  return { data, error }
}

// Export the supabase client directly
export default supabase