import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Impede que a tela de abertura se esconda automaticamente
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Estado para controlar quando o layout está pronto para ser exibido
  const [isLayoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    // Aguarda um tick para garantir que o layout esteja montado
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === "(auth)";

      if (user !== undefined) {
        if (!user && !inAuthGroup) {
          router.replace("/login");
        } else if (user && inAuthGroup) {
          router.replace("/");
        }
      }

      // Marca o layout como pronto para ser exibido
      setLayoutReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [user, segments, router]);

  // Esconde a tela de abertura somente quando o layout estiver pronto
  useEffect(() => {
    if (isLayoutReady) {
      SplashScreen.hideAsync();
    }
  }, [isLayoutReady]);

  // Sempre renderiza o Slot para evitar erro de navegação prematura
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
