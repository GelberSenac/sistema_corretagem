// Em src/components/CartaoPerfil.js
import { Image, StyleSheet, Text, View } from "react-native";

// Recebe os dados via props (com desestruturação)
export default function CartaoPerfil({ nome, profissao, urlFoto }) {
  return (
    <View style={styles.cartao}>
      <Image source={{ uri: urlFoto }} style={styles.foto} />
      <Text style={styles.nome}>{nome}</Text>
      <Text style={styles.profissao}>{profissao}</Text>
    </View>
  );
}

// Código do StyleSheet
const styles = StyleSheet.create({
  cartao: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
    // Sombra para Android
    elevation: 4,
    // Sombra para iOS e Web
    boxShadow: "0px 2px 2.62px rgba(0, 0, 0, 0.23)",
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 50, // Deixa a imagem redonda
    marginBottom: 15,
  },
  nome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  profissao: {
    fontSize: 16,
    color: "#666",
  },
});
