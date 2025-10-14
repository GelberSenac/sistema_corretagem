import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View, FlatList, Alert, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header/Header";
import { ThemedView } from "../../../components/themed-view";
import { ThemedText } from "../../../components/themed-text";
import { useAuth } from "../../../context/AuthContext";
import { Usuario, getUsuarios, createUsuario, updateUsuario, deactivateUsuario } from "../../../services/api";
import { useRouter } from "expo-router";

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<{ id?: number; nome: string; email: string; role?: string; ativo?: boolean; senha?: string; endereco?: { id?: number; logradouro?: string; numero?: string; complemento?: string; bairro?: string; cidade?: string; estado?: string; cep?: string }; perfil_corretor?: { id?: number; creci?: string; creci_estado?: string } }>({ nome: "", email: "" });

  // Redireciona imediatamente se o usuário não for ADMIN
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, router]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados somente se ADMIN
  useEffect(() => {
    if (isAdmin) {
      loadUsuarios();
    }
  }, [isAdmin]);

  const resetForm = () => setForm({ nome: "", email: "", role: "", ativo: true, senha: "", endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" }, perfil_corretor: { creci: "", creci_estado: "" } });

  const onSubmit = async () => {
    const payload: any = {
      nome: form.nome?.trim(),
      email: form.email?.trim(),
    };
    if (!payload.nome || !payload.email) {
      Alert.alert("Validação", "Nome e email são obrigatórios");
      return;
    }
    if (form.senha) payload.password = form.senha;
    if (form.role) payload.role = form.role;
    if (typeof form.ativo === "boolean") payload.ativo = form.ativo;
    if (form.endereco && (form.endereco.logradouro || form.endereco.numero || form.endereco.bairro || form.endereco.cidade || form.endereco.estado || form.endereco.cep || form.endereco.complemento)) {
      payload.endereco_attributes = { ...form.endereco };
    }
    if (form.perfil_corretor && (form.perfil_corretor.creci || form.perfil_corretor.creci_estado)) {
      payload.perfil_corretor_attributes = { ...form.perfil_corretor };
    }

    try {
      setLoading(true);
      if (form.id) {
        await updateUsuario(form.id, payload);
      } else {
        await createUsuario(payload);
      }
      resetForm();
      await loadUsuarios();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u: Usuario) => {
    setForm({ id: u.id, nome: u.nome || "", email: u.email || "", role: u.role || "", ativo: u.ativo ?? true, endereco: u.endereco || { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" }, perfil_corretor: u.perfil_corretor || { creci: "", creci_estado: "" } });
  };

  const onDeactivate = async (id: number) => {
    Alert.alert("Confirmar", "Deseja desativar este usuário?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Desativar", style: "destructive", onPress: async () => {
        try {
          setLoading(true);
          await deactivateUsuario(id);
          await loadUsuarios();
        } catch (e: any) {
          Alert.alert("Erro", e?.message || "Falha ao desativar usuário");
        } finally {
          setLoading(false);
        }
      } }
    ]);
  };

  // Se não for ADMIN, evita renderizar a tela de gestão
  if (!isAdmin) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView>
          <Header userName={user?.nome || ""} userRole={user?.role} />
          <ThemedText type="title" style={styles.title}>Acesso negado</ThemedText>
          <ThemedText>Você não tem permissão para acessar a gestão de usuários.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const renderItem = ({ item }: { item: Usuario }) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{item.nome}</ThemedText>
        <ThemedText style={styles.subText}>{item.email}</ThemedText>
        {!!item.role && <ThemedText style={styles.subText}>Role: {item.role}</ThemedText>}
        <ThemedText style={styles.subText}>Status: {item.ativo ? "Ativo" : "Inativo"}</ThemedText>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => startEdit(item)} style={[styles.button, styles.edit]}>
          <ThemedText style={styles.buttonText}>Editar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDeactivate(item.id)} style={[styles.button, styles.delete]}>
          <ThemedText style={styles.buttonText}>Desativar</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={usuarios}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={(
            <View>
              <Header userName={user?.nome || ""} userRole={user?.role} />
              <ThemedText type="title" style={styles.title}>Usuários</ThemedText>

              <View style={styles.form}>
                <TextInput
                  placeholder="Nome"
                  value={form.nome}
                  onChangeText={(t) => setForm((f) => ({ ...f, nome: t }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="E-mail"
                  value={form.email}
                  onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Senha (para novo usuário)"
                  value={form.senha}
                  onChangeText={(t) => setForm((f) => ({ ...f, senha: t }))}
                  style={styles.input}
                />
                <View style={styles.switchRow}>
                  <Switch
                    value={!!form.ativo}
                    onValueChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
                  />
                  <ThemedText style={{ marginLeft: 8 }}>Ativo</ThemedText>
                </View>
                <TextInput
                  placeholder="Role (ex.: admin, corretor)"
                  value={form.role}
                  onChangeText={(t) => setForm((f) => ({ ...f, role: t }))}
                  style={styles.input}
                  autoCapitalize="none"
                />
                <View style={styles.formActions}>
                  <TouchableOpacity onPress={onSubmit} style={[styles.button, styles.primary]}>
                    <ThemedText style={styles.buttonText}>Salvar</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={resetForm} style={[styles.button, styles.secondary]}>
                    <ThemedText style={styles.buttonText}>Limpar</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<ThemedText style={{ marginTop: 16 }}>{loading ? "" : "Nenhum usuário cadastrado"}</ThemedText>}
          refreshing={loading}
          onRefresh={loadUsuarios}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        />
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
  switchRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
});