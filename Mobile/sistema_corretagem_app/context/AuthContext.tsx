import React, { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  signIn: () => void;
  signOut: () => void;
  user: { name: string } | null | undefined; // undefined indica carregamento
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null | undefined>(undefined);

  // Simula verificação de autenticação inicial
  useEffect(() => {
    // Simula um delay de verificação de token/sessão
    const timer = setTimeout(() => {
      // Por padrão, usuário não está logado
      setUser(null);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const signIn = () => {
    setUser({ name: "Gelber" });
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
