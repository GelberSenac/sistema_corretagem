import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View, FlatList, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header/Header";
import { ThemedView } from "../../../components/themed-view";
import { ThemedText } from "../../../components/themed-text";
import { useAuth } from "../../../context/AuthContext";
import { Imovel, getImoveis, createImovel, updateImovel, deleteImovel } from "../../../services/api";

export default function ImoveisPage() {
  const { user } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<{ id?: number; nome_empreendimento: string; tipo?: string; finalidade?: string; valor?: string; status?: string; endereco?: { id?: number; logradouro?: string; numero?: string; complemento?: string; bairro?: string; cidade?: string; estado?: string; cep?: string } }>({ nome_empreendimento: "" });

  const loadImoveis = async () => {
    try {
      setLoading(true);
      const data = await getImoveis();
      setImoveis(data);
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao carregar imóveis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImoveis();
  }, []);

  const resetForm = () => setForm({ nome_empreendimento: "", tipo: "", finalidade: "", valor: "", status: "", endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" } });

  const onSubmit = async () => {
    const payload: any = {
      nome_empreendimento: form.nome_empreendimento?.trim(),
      tipo: form.tipo?.trim() || undefined,
      finalidade: form.finalidade?.trim() || undefined,
      valor: form.valor ? Number(form.valor) : undefined,
      status: form.status?.trim() || undefined,
    };
    if (!payload.nome_empreendimento) {
      Alert.alert("Validação", "Nome do empreendimento é obrigatório");
      return;
    }
    if (form.endereco && (form.endereco.logradouro || form.endereco.numero || form.endereco.bairro || form.endereco.cidade || form.endereco.estado || form.endereco.cep || form.endereco.complemento)) {
      payload.endereco_attributes = { ...form.endereco };
    }

    try {
      setLoading(true);
      if (form.id) {
        await updateImovel(form.id, payload);
      } else {
        await createImovel(payload);
      }
      resetForm();
      await loadImoveis();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao salvar imóvel");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (i: Imovel) => {
    setForm({ id: i.id, nome_empreendimento: i.nome_empreendimento || "", tipo: i.tipo || "", finalidade: i.finalidade || "", valor: i.valor ? String(i.valor) : "", status: i.status || "", endereco: i.endereco || { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" } });
  };

  const onDelete = async (id: number) => {
    Alert.alert("Confirmar", "Deseja excluir este imóvel?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try {
          setLoading(true);
          await deleteImovel(id);
          await loadImoveis();
        } catch (e: any) {
          Alert.alert("Erro", e?.message || "Falha ao excluir imóvel");
        } finally {
          setLoading(false);
        }
      } }
    ]);
  };

  const renderItem = ({ item }: { item: Imovel }) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{item.nome_empreendimento}</ThemedText>
        {!!item.tipo && <ThemedText style={styles.subText}>Tipo: {item.tipo}</ThemedText>}
        {!!item.finalidade && <ThemedText style={styles.subText}>Finalidade: {item.finalidade}</ThemedText>}
        {!!item.valor && <ThemedText style={styles.subText}>Valor: R$ {item.valor}</ThemedText>}
        {!!item.status && <ThemedText style={styles.subText}>Status: {item.status}</ThemedText>}
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={imoveis}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={(
            <View>
              <Header userName={user?.nome || ""} userRole={user?.role} />
              <ThemedText type="title" style={styles.title}>Imóveis</ThemedText>

              <View style={styles.form}>
                <TextInput
                  placeholder="Nome do Empreendimento"
                  value={form.nome_empreendimento}
                  onChangeText={(t) => setForm((f) => ({ ...f, nome_empreendimento: t }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Tipo"
                  value={form.tipo}
                  onChangeText={(t) => setForm((f) => ({ ...f, tipo: t }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Finalidade"
                  value={form.finalidade}
                  onChangeText={(t) => setForm((f) => ({ ...f, finalidade: t }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Valor"
                  value={form.valor}
                  onChangeText={(t) => setForm((f) => ({ ...f, valor: t }))}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Status"
                  value={form.status}
                  onChangeText={(t) => setForm((f) => ({ ...f, status: t }))}
                  style={styles.input}
                />

                {/* Endereço */}
                <ThemedText type="defaultSemiBold" style={{ marginTop: 8 }}>Endereço</ThemedText>
                <TextInput placeholder="Logradouro" value={form.endereco?.logradouro || ""} onChangeText={(t) => setForm((f) => ({ ...f, endereco: { ...(f.endereco || {}), logradouro: t } }))} style={styles.input} />
                <TextInput placeholder="Número" value={form.endereco?.numero || ""} onChangeText={(t) => setForm((f) => ({ ...f, endereco: { ...(f.endereco || {}), numero: t } }))} style={styles.input} />
                <TextInput placeholder="Complemento" value={form.endereco?.complemento || ""} onChangeText={(t) => setForm((f) => ({ ...f, endereco: { ...(f.endereco || {}), complemento: t } }))} style={styles.input} />
                <TextInput placeholder="Bairro" value={form.endereco?.bairro || ""} onChangeText={(t) => setForm((f) => ({ ...f, endereco: { ...(f.endereco || {}), bairro: t } }))} style={styles.input} />
                <TextInput placeholder="Cidade" value={form.endereco?.cidade || ""} onChangeText={(t) => setForm((f) => ({ ...f, endereco: { ...(f.endereco || {}), cidade: t } }))} style={styles.input} />
                <TextInput placeholder="Estado" value={form.endereco?.estado || ""} onChangeText={(t) => setForm((f) => ({ ...f, endereco: { ...(f.endereco || {}), estado: t } }))} style={styles.input} />
                <TextInput placeholder="CEP" value={form.endereco?.cep || ""} onChangeText={(t) => setForm((f) => ({ ...f, endereco: { ...(f.endereco || {}), cep: t } }))} style={styles.input} />

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
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<ThemedText style={{ marginTop: 16 }}>{loading ? "" : "Nenhum imóvel cadastrado"}</ThemedText>}
          refreshing={loading}
          onRefresh={loadImoveis}
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
});