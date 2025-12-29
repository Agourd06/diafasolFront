import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest } from "../../../api/auth.api";
import { LoginPayload } from "../types";
import { useAuth } from "../../../hooks/useAuth";

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: (data) => {
      login(data);
      const redirectTo = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  });
};

