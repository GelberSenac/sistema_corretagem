// src/Componentes/Debug/Logs.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getConsoleLogs,
  getConsoleErrors,
  getNetworkLogs,
  getNetworkErrors,
} from "../../Servicos/Api";

const formatTime = (ts) => {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
};

const Section = ({ title, items }) => {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      {items.length === 0 ? (
        <p style={{ color: "#666" }}>Sem registros ainda.</p>
      ) : (
        <div style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "#fafafa",
          maxHeight: 320,
          overflow: "auto",
        }}>
          {items.map((it, idx) => (
            <div
              key={idx}
              style={{
                borderBottom: "1px dashed #e0e0e0",
                paddingBottom: 8,
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 12, color: "#999" }}>{formatTime(it.ts)}</div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(it, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default function LogsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  // Atualiza automaticamente a cada 2s quando habilitado
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setRefreshTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // Coleta dos buffers globais
  const consoleLogs = useMemo(() => getConsoleLogs(), [refreshTick]);
  const consoleErrors = useMemo(() => getConsoleErrors(), [refreshTick]);
  const networkLogs = useMemo(() => getNetworkLogs(), [refreshTick]);
  const networkErrors = useMemo(() => getNetworkErrors(), [refreshTick]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Logs de Depuração</h1>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Atualização automática (2s)
        </label>
        <button onClick={() => setRefreshTick((t) => t + 1)}>Atualizar agora</button>
      </div>

      <Section title="Console Logs" items={consoleLogs} />
      <Section title="Console Errors" items={consoleErrors} />
      <Section title="Network Logs" items={networkLogs} />
      <Section title="Network Errors" items={networkErrors} />

      <p style={{ color: "#777", fontSize: 12 }}>
        Observação: Estes registros só são coletados em ambiente de desenvolvimento.
      </p>
    </div>
  );
}