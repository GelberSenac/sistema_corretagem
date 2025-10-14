import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header/Header";
import { ThemedView } from "../../components/themed-view";
import { ThemedText } from "../../components/themed-text";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "../../services/api";

interface DashboardStats {
  clientes_count: number;
  imoveis_count: number;
  usuarios_count: number;
  propostas_pendentes: number;
  agendamentos_hoje: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiGet<DashboardStats>("/api/v1/dashboard_stats");
      setStats(data);
    } catch (e: any) {
      // fallback: mantém tela simples se endpoint não existir
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Aguarda autenticação: só carrega stats quando já temos user !== undefined
    if (user !== undefined) {
      if (user) {
        loadDashboard();
      } else {
        // Usuário não autenticado: mantém placeholders e evita chamada 401
        setStats(null);
      }
    }
  }, [user]);
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <Header userName={user?.nome || ""} userRole={user?.role} />
        <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>

        {loading && (
          <View style={styles.centerRow}><ActivityIndicator /></View>
        )}

        {!loading && stats && (
          <View style={styles.grid}>
            <View style={styles.card}><ThemedText type="subtitle">Clientes</ThemedText><ThemedText type="title">{stats.clientes_count}</ThemedText></View>
            <View style={styles.card}><ThemedText type="subtitle">Imóveis</ThemedText><ThemedText type="title">{stats.imoveis_count}</ThemedText></View>
            <View style={styles.card}><ThemedText type="subtitle">Usuários</ThemedText><ThemedText type="title">{stats.usuarios_count}</ThemedText></View>
            <View style={styles.card}><ThemedText type="subtitle">Propostas pendentes</ThemedText><ThemedText type="title">{stats.propostas_pendentes}</ThemedText></View>
            <View style={styles.card}><ThemedText type="subtitle">Agendamentos hoje</ThemedText><ThemedText type="title">{stats.agendamentos_hoje}</ThemedText></View>
          </View>
        )}

        {!loading && !stats && (
          <View style={styles.centerRow}>
            <ThemedText>Bem-vindo! Use as abas abaixo para navegar. Em breve, indicadores do sistema aqui.</ThemedText>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { margin: 16, fontWeight: "700" },
  centerRow: { padding: 16, alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", minWidth: 140 },
});
