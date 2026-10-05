import { useState, useEffect, useCallback } from 'react'
import { supabase, signInWithGoogle, signOut as supabaseSignOut } from '../services/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('[Auth] Google giriş hatası:', err)
      setLoading(false)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabaseSignOut()
      setUser(null)
      setSession(null)
    } catch (err) {
      console.error('[Auth] Çıkış hatası:', err)
    }
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,

    userInfo: user ? {
      id: user.id,
      name: user.user_metadata?.full_name || user.email,
      email: user.email,
      avatar: user.user_metadata?.avatar_url,
    } : null,
  }
}
