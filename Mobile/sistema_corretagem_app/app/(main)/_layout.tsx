import { Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/theme";

export default function MainLayout() {
  const { user } = useAuth();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="clientes/index"
        options={{
          title: "Clientes",
        }}
      />
      <Tabs.Screen
        name="imoveis/index"
        options={{
          title: "Imóveis",
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="usuarios/index"
          options={{
            title: "Usuários",
          }}
        />
      )}
    </Tabs>
  );
}
