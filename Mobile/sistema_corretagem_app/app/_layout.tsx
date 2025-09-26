// Arquivo: App.js
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Header/Header"; // Assumindo que você criou o Header.js

// Dados de exemplo para a lista (pode manter os mesmos)
const DADOS = [
  { id: "1", title: "Estudar React Native" },
  { id: "2", title: "Praticar Flexbox" },
  { id: "3", title: "Criar um novo app" },
  { id: "4", title: "Tomar um café" },
];

// Componente para renderizar cada item da lista
const Item = ({ title }) => (
  <View style={styles.item}>
    <Text style={styles.itemText}>{title}</Text>
  </View>
);

export default function App() {
  // 2. O estado 'userName' agora vai controlar o texto do Header e do TextInput
  const [userName, setUserName] = useState("Gelber");

  return (
    <SafeAreaView style={styles.container}>
      {/* O Header continua recebendo o nome via props */}
      <Header userName={userName} />

      <FlatList
        data={DADOS}
        renderItem={({ item }) => <Item title={item.title} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        // No topo da lista, vamos adicionar o campo de entrada
        ListHeaderComponent={
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Digite seu nome:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Maria Silva"
              value={userName} // O valor do campo é controlado pelo estado
              onChangeText={setUserName} // Função que atualiza o estado a cada letra digitada
            />
          </View>
        }
      />

      {/* RODAPÉ (FOOTER) */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 - App Incrível</Text>
      </View>
    </SafeAreaView>
  );
}

// Adicionamos os estilos para o TextInput e seu container
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  listContainer: {
    padding: 20,
  },
  // NOVOS ESTILOS PARA O CAMPO DE ENTRADA
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  // Estilos da Lista
  item: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  itemText: {
    fontSize: 16,
  },
  // Estilos do Rodapé
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
