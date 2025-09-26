// Em src/components/BotaoCustomizado.js
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function BotaoCustomizado({ titulo }) {
  return (
    <TouchableOpacity style={styles.botao}>
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
  },
  textoBotao: {
    color: "white",
    fontSize: 16,
  },
});
