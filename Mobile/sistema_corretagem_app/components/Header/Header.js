// Arquivo: Header.js
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";

// O componente recebe 'userName' e 'userRole' via props
export default function Header({ userName, userRole }) {
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  // Define o rótulo do papel para a saudação
  const roleLabel = userRole === "admin" ? "administrador" : userRole === "corretor" ? "corretor" : "usuário";

  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Image
          source={{
            uri: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
          }}
          style={styles.foto}
        />
        <Text style={styles.texto}>Olá {roleLabel} {userName}</Text>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
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
    justifyContent: "space-between", // Distribui espaço entre userInfo e logoutButton
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Ocupa espaço disponível
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
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 2,
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
