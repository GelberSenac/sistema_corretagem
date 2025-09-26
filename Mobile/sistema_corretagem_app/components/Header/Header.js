// Arquivo: Header.js
import { Image, StyleSheet, Text, View } from "react-native";

// O componente recebe 'userName' via props
export default function Header({ userName }) {
  return (
    <View style={styles.header}>
      <Image
        source={{
          uri: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        }}
        style={styles.foto}
      />
      <Text style={styles.texto}>Olá {userName}!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  foto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  texto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
  },
});
