import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ClientsProvider } from "./context/ClientsContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClientsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ClientsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
