import { supabase } from './supabase';
import toast from 'react-hot-toast';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@smarthub.org',
  password: 'admin123'
};

export const createAdminAccount = async () => {
  try {
    // Check if admin already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_CREDENTIALS.email)
      .single();

    if (existingProfile) {
      console.log('Admin account already exists');
      return { success: true, message: 'Admin account already exists' };
    }

    // Create admin user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      options: {
        data: {
          full_name: 'Admin User',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Error creating admin auth:', authError);
      return { success: false, error: authError.message };
    }

    // If user was created, update their profile to admin
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: ADMIN_CREDENTIALS.email,
          full_name: 'Admin User',
          role: 'admin'
        });

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
        return { success: false, error: profileError.message };
      }
    }

    return { success: true, message: 'Admin account created successfully' };
  } catch (error: any) {
    console.error('Error in createAdminAccount:', error);
    return { success: false, error: error.message };
  }
};

export const loginAsAdmin = async () => {
  try {
    // First ensure admin account exists
    await createAdminAccount();

    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password
    });

    if (error) {
      console.error('Admin login error:', error);
      toast.error('Admin login failed: ' + error.message);
      return { success: false, error: error.message };
    }

    toast.success('Welcome, Admin!');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in loginAsAdmin:', error);
    toast.error('Admin login failed');
    return { success: false, error: error.message };
  }
};

export const isAdminCredentials = (email: string, password: string) => {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
};