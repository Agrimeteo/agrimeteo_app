import { supabaseClient, supabaseServiceClient } from '../config/supabase.js';

type RegisterData = {  
    email: string;
    password: string;
    full_name: string;
    role?: 'farmer' | 'beginner' | 'admin';
};
type LoginData = {
    email: string;
    password: string;
};
type RefreshSessionData = {
    refreshToken: string;
};

export const register = async (data: RegisterData) => {
  const profileRole = data.role ?? null;

  const { data: userData, error } = await supabaseClient.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        ...(profileRole ? { role: profileRole } : {}),
      }
    }
  });

  if (error) throw new Error(error.message);

  // Create profile after signup
  if (userData.user) {
    const { error: profileError } = await supabaseServiceClient
      .from('profiles')
      .upsert({
        id: userData.user.id,
        full_name: data.full_name,
        email: userData.user.email ?? data.email,
        role: profileRole
      });

    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);
  }

  return userData;
};

export const login = async (data: LoginData) => {
  const { data: sessionData, error } = await supabaseClient.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });

  if (error) throw new Error(error.message);
  return sessionData;
};

export const refreshSession = async (data: RefreshSessionData) => {
  const { data: sessionData, error } = await supabaseClient.auth.refreshSession({
    refresh_token: data.refreshToken,
  });

  if (error) throw new Error(error.message);
  return sessionData;
};

export const getMe = async (token: string) => {
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error) throw new Error(error.message);
  return user;
};
