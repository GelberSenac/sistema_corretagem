// Em src/components/CartaoPerfil.js
import { Image, Text, View } from "react-native";

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

// ... (código do StyleSheet aqui) ...
