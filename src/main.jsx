// src/main.jsx
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from './lib/react-query';
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster position="top-right" richColors expand closeButton />


  </QueryClientProvider>
);