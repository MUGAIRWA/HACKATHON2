import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile, getProfile } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await getProfile(userId)
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, this is expected for new users
          console.log('Profile not found, will be created by database trigger')
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message)
      // Don't show error toast for missing profiles as they'll be created automatically
      if (error.code !== 'PGRST116') {
        toast.error('Error loading profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role,
            school: userData.school,
            grade: userData.grade,
            phone: userData.phone
          }
        }
      })
      
      if (error) {
        console.error('Signup error:', error)
        throw error
      }
      
      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account!')
      } else if (data.session) {
        toast.success('Account created successfully!')
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Error in signUp:', error)
      toast.error(error.message || 'Failed to create account')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Signin error:', error)
        throw error
      }
      
      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error: any) {
      console.error('Error in signIn:', error)
      toast.error(error.message || 'Failed to sign in')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error: any) {
      console.error('Error in signOut:', error)
      toast.error(error.message || 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      setProfile(data)
      toast.success('Profile updated successfully')
      return { data, error: null }
    } catch (error: any) {
      console.error('Error in updateProfile:', error)
      toast.error(error.message || 'Failed to update profile')
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}