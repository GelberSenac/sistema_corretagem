import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, TextInput, View, FlatList, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header/Header";
import { ThemedView } from "../../../components/themed-view";
import { ThemedText } from "../../../components/themed-text";
import { useAuth } from "../../../context/AuthContext";
import { Cliente, getClientes, createCliente, updateCliente, deleteCliente } from "../../../services/api";

export default function ClientesPage() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<{ id?: number; nome: string; email?: string; telefone?: string }>({ nome: "" });
  const [query, setQuery] = useState<string>("");

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const resetForm = () => setForm({ nome: "", email: "", telefone: "" });

  const onSubmit = async () => {
    const payload = { nome: form.nome?.trim(), email: form.email?.trim() || undefined, telefone: form.telefone?.trim() || undefined };
    if (!payload.nome) {
      Alert.alert("Validação", "Nome é obrigatório");
      return;
    }
    if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) {
      Alert.alert("Validação", "Email inválido");
      return;
    }

    try {
      setLoading(true);
      if (form.id) {
        await updateCliente(form.id, payload);
      } else {
        await createCliente(payload);
      }
      resetForm();
      await loadClientes();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: Cliente) => {
    setForm({ id: c.id, nome: c.nome || "", email: c.email || "", telefone: c.telefone || "" });
  };

  const onDelete = async (id: number) => {
    Alert.alert("Confirmar", "Deseja excluir este cliente?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try {
          setLoading(true);
          await deleteCliente(id);
          await loadClientes();
        } catch (e: any) {
          Alert.alert("Erro", e?.message || "Falha ao excluir cliente");
        } finally {
          setLoading(false);
        }
      } }
    ]);
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{item.nome}</ThemedText>
        {!!item.email && <ThemedText style={styles.subText}>{item.email}</ThemedText>}
        {!!item.telefone && <ThemedText style={styles.subText}>{item.telefone}</ThemedText>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => startEdit(item)} style={[styles.button, styles.edit]}>
          <ThemedText style={styles.buttonText}>Editar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.button, styles.delete]}>
          <ThemedText style={styles.buttonText}>Excluir</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredClientes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) => {
      const nome = (c.nome || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const telefone = (c.telefone || "").toLowerCase();
      return nome.includes(q) || email.includes(q) || telefone.includes(q);
    });
  }, [query, clientes]);

  const maskPhone = (value: string) => {
    const digits = (value || "").replace(/\D/g, "");
    if (digits.length <= 10) {
      // (XX) XXXX-XXXX
      const part1 = digits.slice(0, 2);
      const part2 = digits.slice(2, 6);
      const part3 = digits.slice(6, 10);
      let out = "";
      if (part1) out += `(${part1}`;
      if (part1 && part1.length === 2) out += ") ";
      if (part2) out += part2;
      if (part3) out += `-${part3}`;
      return out;
    } else {
      // (XX) XXXXX-XXXX
      const part1 = digits.slice(0, 2);
      const part2 = digits.slice(2, 7);
      const part3 = digits.slice(7, 11);
      let out = "";
      if (part1) out += `(${part1}`;
      if (part1 && part1.length === 2) out += ") ";
      if (part2) out += part2;
      if (part3) out += `-${part3}`;
      return out;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={80}>
          <FlatList
            data={filteredClientes}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: 48 } ]}
            ListEmptyComponent={<ThemedText style={{ marginTop: 16 }}>{loading ? "" : "Nenhum cliente cadastrado"}</ThemedText>}
            refreshing={loading}
            onRefresh={loadClientes}
            ListHeaderComponent={
              <View>
                <Header userName={user?.nome || ""} userRole={user?.role} />
                <ThemedText type="title" style={styles.title}>Clientes</ThemedText>

                <TextInput
                  placeholder="Buscar por nome, email ou telefone"
                  value={query}
                  onChangeText={setQuery}
                  style={[styles.input, { marginBottom: 12 }]}
                  autoCorrect={false}
                  autoCapitalize="none"
                />

                <View style={styles.form}>
                  <TextInput
                    placeholder="Nome"
                    value={form.nome}
                    onChangeText={(t) => setForm((f) => ({ ...f, nome: t }))}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Email"
                    value={form.email}
                    onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    placeholder="Telefone"
                    value={form.telefone}
                    onChangeText={(t) => setForm((f) => ({ ...f, telefone: maskPhone(t) }))}
                    style={styles.input}
                    keyboardType="phone-pad"
                  />
                  <View style={styles.formActions}>
                    <TouchableOpacity onPress={onSubmit} style={[styles.button, styles.primary]} disabled={loading}>
                      <ThemedText style={styles.buttonText}>{form.id ? "Salvar" : "Adicionar"}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={resetForm} style={[styles.button, styles.secondary]} disabled={loading}>
                      <ThemedText style={styles.buttonText}>Limpar</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { margin: 16, fontWeight: "700" },
  form: { marginHorizontal: 16, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  formActions: { flexDirection: "row", gap: 8 },
  button: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  primary: { backgroundColor: "#2e7d32" },
  secondary: { backgroundColor: "#607d8b" },
  edit: { backgroundColor: "#1976d2" },
  delete: { backgroundColor: "#d32f2f" },
  buttonText: { color: "#fff" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  actions: { flexDirection: "row", gap: 8 },
  subText: { color: "#666" },
});