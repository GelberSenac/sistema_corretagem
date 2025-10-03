// Em src/components/BotaoCustomizado.js
import { StyleSheet, Text, TouchableOpacity } from "react-native";

// Adicione onPress às props recebidas
export default function BotaoCustomizado({ titulo, onPress }) {
  return (
    // Passe a função onPress para o TouchableOpacity
    <TouchableOpacity style={styles.botao} onPress={onPress}>
      <Text style={styles.textoBotao}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10, // Adicionei um espaço acima do botão
  },
  textoBotao: {
    color: "white",
    fontSize: 16,
  },
});
