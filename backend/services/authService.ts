import { supabaseClient, supabaseServiceClient } from '../config/supabase.js';

type RegisterData = {  
    email: string;
    password: string;
    full_name: string;
    role?: 'farmer' | 'beginner' | 'admin' | 'user';
};
type LoginData = {
    email: string;
    password: string;
};

export const register = async (data: RegisterData) => {
  const profileRole = data.role || 'farmer';

  const { data: userData, error } = await supabaseClient.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        role: profileRole,
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

export const getMe = async (token: string) => {
  // Mock for demo - in production, use real Supabase auth
  if (token.startsWith('mock-jwt-token-')) {
    return {
      id: '1',
      email: 'user@example.com',
      user_metadata: { full_name: 'Maria' }
    };
  }
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error) throw new Error(error.message);
  return user;
};
