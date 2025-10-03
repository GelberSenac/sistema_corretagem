// Arquivo: _layout.tsx
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Todos os nossos componentes customizados importados
import BotaoCustomizado from "../../components/BotaoCustomizado/BotaoCustomizado";
import CartaoPerfil from "../../components/CartaoPerfil/CartaoPerfil";
import Header from "../../components/Header/Header";
import { useAuth } from "../../context/AuthContext"; // 1. IMPORTE O useAuth

// Dados de perfis para a lista
const DADOS = [
  {
    id: "1",
    nome: "Ana Clara",
    profissao: "Engenheira de Software",
    urlFoto: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  },
  {
    id: "2",
    nome: "Carlos Souza",
    profissao: "Designer UX/UI",
    urlFoto: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
  },
  {
    id: "3",
    nome: "Mariana Costa",
    profissao: "Gerente de Projetos",
    urlFoto:
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
  },
];

export default function App() {
  // --- Estados para a funcionalidade de mudar o nome ---
  const { user } = useAuth(); // 2. PEGUE O USUÁRIO DO CONTEXTO

  const [userName, setUserName] = useState(user?.name || "Gelber");
  const [inputValue, setInputValue] = useState("");

  // --- Função do botão para confirmar o nome ---
  const handleConfirmName = () => {
    if (inputValue.trim() !== "") {
      setUserName(inputValue);
      Alert.alert("Sucesso!", `O nome foi alterado para ${inputValue}.`);
      setInputValue("");
    } else {
      Alert.alert("Atenção", "Por favor, digite um nome antes de confirmar.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header userName={userName} />

      <FlatList
        data={DADOS}
        // renderItem agora usa o CartaoPerfil
        renderItem={({ item }) => (
          <CartaoPerfil
            nome={item.nome}
            profissao={item.profissao}
            urlFoto={item.urlFoto}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        // ListHeaderComponent está de volta, com o TextInput e o Botão
        ListHeaderComponent={
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Alterar nome do usuário:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o novo nome"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <BotaoCustomizado
              titulo="Confirmar Nome"
              onPress={handleConfirmName}
            />
          </View>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 - App Incrível</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Estilos para o container do input e botão
  inputContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  footer: {
    height: 50,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
  },
});
