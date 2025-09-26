// src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./Contextos/AuthContexto.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Envolva o App com o AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
