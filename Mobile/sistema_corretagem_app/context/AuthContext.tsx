import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { loginRequest, setAuthToken } from "../services/api";

type AuthUser = { id: number; nome: string; role: string };

type AuthContextType = {
  signIn: (login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: AuthUser | null | undefined; // undefined indica carregamento
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  // Restaura sessão ao iniciar
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          // Opcionalmente podemos buscar perfil do usuário autenticado
          // Por ora, mantemos user mínimo localmente; backend não tem endpoint /me ainda
          setUser({ id: 0, nome: "Usuário", role: "" });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const signIn = async (login: string, password: string) => {
    const { user: backendUser, token } = await loginRequest(login, password);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(backendUser);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
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
