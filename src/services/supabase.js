import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[eTurizm] Supabase ortam değişkenleri eksik. .env dosyasını kontrol edin.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {

    persistSession: true,
    autoRefreshToken: true,
  },
})

export async function signInWithGoogle() {
  const redirectTo = `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function saveTrip(tripData) {
  const user = await getUser()
  if (!user) throw new Error('Seyahat kaydetmek için giriş yapmalısınız.')

  const shareId = generateShareId()

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title: tripData.title || `${tripData.city} Seyahati`,
      city: tripData.city,

      places: tripData.places || [],
      constraints: tripData.constraints || { walk: 15, transit: 30 },
      map_state: tripData.mapState || {},
      share_id: shareId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTrip(tripId, updates) {
  const user = await getUser()
  if (!user) throw new Error('Giriş yapmalısınız.')

  const { data, error } = await supabase
    .from('trips')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserTrips() {
  const user = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trips')
    .select('id, title, city, created_at, updated_at, share_id, places')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTripById(tripId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (error) throw error
  return data
}

export async function getTripByShareId(shareId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('share_id', shareId)
    .single()

  if (error) throw error
  return data
}

export async function deleteTrip(tripId) {
  const user = await getUser()
  if (!user) throw new Error('Giriş yapmalısınız.')

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', user.id)

  if (error) throw error
}

function generateShareId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function buildShareUrl(shareId) {
  const base = import.meta.env.VITE_APP_URL || window.location.origin
  return `${base}/trip/${shareId}`
}
