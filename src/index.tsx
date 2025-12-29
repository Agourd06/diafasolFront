import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/index.css";
import "./i18n/config"; // Initialize i18n
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// Conditionally load ReactQueryDevtools only in development
const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() => import("@tanstack/react-query-devtools").then((d) => ({ default: d.ReactQueryDevtools })))
  : null;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
    {ReactQueryDevtools && (
      <React.Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </React.Suspense>
    )}
  </QueryClientProvider>
);

reportWebVitals();
