import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rawzqppksgawbodjgwsx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhd3pxcHBrc2dhd2JvZGpnd3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDY0NzUsImV4cCI6MjA3MTg4MjQ3NX0.frPkdJdnS5UhrCKS0qIIpRDbhw7N0sWPadn2uUx-pIc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'donor' | 'admin'
  school?: string
  grade?: string
  phone?: string
  avatar_url?: string
  balance?: number
  created_at: string
  updated_at: string
}

export interface MealRequest {
  id: string
  student_id: string
  title: string
  description: string
  amount: number
  meal_type: string
  requested_for: string
  status: 'pending' | 'approved' | 'funded' | 'completed' | 'rejected'
  approved_by?: string
  approved_at?: string
  funded_by?: string
  funded_at?: string
  created_at: string
  updated_at: string
  // Joined fields
  student?: Profile
  donor?: Profile
}

export interface Donation {
  id: string
  donor_id: string
  meal_request_id: string
  amount: number
  payment_method?: string
  payment_reference?: string
  status: 'pending' | 'completed' | 'failed'
  message?: string
  created_at: string
  updated_at: string
  // Joined fields
  donor?: Profile
  meal_request?: MealRequest
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  data?: any
  created_at: string
}

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// Meal request helpers
export const getMealRequests = async (filters?: { status?: string, student_id?: string }) => {
  let query = supabase
    .from('meal_requests')
    .select(`
      *,
      student:profiles(*),
      donor:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.student_id) {
    query = query.eq('student_id', filters.student_id)
  }

  const { data, error } = await query
  return { data, error }
}

export const createMealRequest = async (request: Omit<MealRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('meal_requests')
    .insert(request)
    .select()
    .single()
  return { data, error }
}

export const updateMealRequest = async (id: string, updates: Partial<MealRequest>) => {
  const { data, error } = await supabase
    .from('meal_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// Donation helpers
export const getDonations = async (filters?: { donor_id?: string, meal_request_id?: string }) => {
  let query = supabase
    .from('donations')
    .select(`
      *,
      donor:profiles(*),
      meal_request:meal_requests(*, student:profiles(*))
    `)
    .order('created_at', { ascending: false })

  if (filters?.donor_id) {
    query = query.eq('donor_id', filters.donor_id)
  }
  if (filters?.meal_request_id) {
    query = query.eq('meal_request_id', filters.meal_request_id)
  }

  const { data, error } = await query
  return { data, error }
}

export const createDonation = async (donation: Omit<Donation, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single()
  return { data, error }
}

// AI Meal Recommendations
export const getMealRecommendations = async (preferences: {
  userPreferences?: string[]
  budget?: number
  mealType?: string
  dietaryRestrictions?: string[]
}) => {
  const { data, error } = await supabase.functions.invoke('meal-recommendations', {
    body: preferences
  })
  return { data, error }
}

// Notifications
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const markNotificationAsRead = async (id: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  return { data, error }
}

// Donor balance helpers
export const getDonorBalance = async (donorId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', donorId)
    .single()
  return { data: data?.balance || 0, error }
}

export const updateDonorBalance = async (donorId: string, newBalance: number) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', donorId)
    .select()
    .single()
  return { data, error }
}

export const addFundsToDonorBalance = async (donorId: string, amount: number) => {
  // First get current balance
  const { data: currentBalance, error: balanceError } = await getDonorBalance(donorId)
  if (balanceError) return { data: null, error: balanceError }

  // Calculate new balance
  const newBalance = (currentBalance || 0) + amount

  // Update balance
  return await updateDonorBalance(donorId, newBalance)
}
