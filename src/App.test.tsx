import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

test("renders home hero", () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
  const heading = screen.getByText(/Pilotez vos destinations/i);
  expect(heading).toBeInTheDocument();
});
