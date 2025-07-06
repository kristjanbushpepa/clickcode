
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  hasAdminUsers: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdminUsers, setHasAdminUsers] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user);
      checkHasAdminUsers();
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        checkAdminStatus(session?.user);
        checkHasAdminUsers();
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkHasAdminUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('has_admin_users');
      if (error) {
        console.error('Error checking admin users:', error);
        setHasAdminUsers(false);
      } else {
        setHasAdminUsers(data || false);
      }
    } catch (error) {
      console.error('Error checking admin users:', error);
      setHasAdminUsers(false);
    }
  };

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    
    // If signup successful and this is the first admin, create admin user record
    if (data.user && !hasAdminUsers) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'admin'
        });
      
      if (adminError) {
        console.error('Error creating admin user:', adminError);
        throw adminError;
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      hasAdminUsers,
      signIn, 
      signOut,
      signUp 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
