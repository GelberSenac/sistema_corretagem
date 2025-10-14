import React, { useState } from "react";
import { TextInput, Button, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useColorScheme() ?? "light";
  const textColor = useThemeColor({}, "text");
  const borderColor = theme === "light" ? "#ccc" : "#3A3F44";
  const inputBg = theme === "light" ? "#ffffff" : "#1E2126";
  const placeholder = theme === "light" ? "#6b7280" : "#9BA1A6";

  const handleSubmit = async () => {
    if (!login || !password) {
      Alert.alert("Erro", "Informe login e senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(login, password);
    } catch (e: any) {
      Alert.alert("Falha ao entrar", e?.message || "Verifique suas credenciais");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
      <StatusBar style={theme === "light" ? "dark" : "light"} />

      <ThemedText type="title" style={{ marginBottom: 16 }}>Entrar</ThemedText>

      <TextInput
        placeholder="Login"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
        placeholderTextColor={placeholder}
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor,
          padding: 8,
          marginBottom: 12,
          backgroundColor: inputBg,
          color: textColor,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={placeholder}
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor,
          padding: 8,
          marginBottom: 12,
          backgroundColor: inputBg,
          color: textColor,
          borderRadius: 8,
        }}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Entrar" onPress={handleSubmit} />
      )}

      <ThemedText style={{ marginTop: 16, fontSize: 12 }}>
        Autenticação via JWT. Credenciais reais do sistema são necessárias.
      </ThemedText>
    </ThemedView>
  );
}
