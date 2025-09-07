import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateLastLogin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const createUserProfile = useCallback(async (userId: string) => {
    try {
      // Get user details from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email || 'User',
          role: 'USER',
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return
      }

      console.log('✅ User profile created successfully:', data)
      setUserProfile(data)
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }, [])

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating new one...')
        await createUserProfile(userId)
        return
      }

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [createUserProfile])

  const updateLastLogin = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          last_login_at: new Date().toISOString(),
          last_login_ip: '127.0.0.1',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating last login:', error)
      }
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }, [user])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
        await updateLastLogin()
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
          if (event === 'SIGNED_IN') {
            await updateLastLogin()
          }
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchUserProfile, updateLastLogin])


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signOut,
    updateLastLogin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}