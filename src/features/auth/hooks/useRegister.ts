import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "../../../api/auth.api";
import { createGroup } from "../../../api/groups.api";
import { setStoredAuth } from "../../../utils/storage";
import { RegisterPayload } from "../types";
import { useAuth } from "../../../hooks/useAuth";

export const useRegister = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      // Step 1: Register the user and company
      const authResponse = await registerRequest({
        username: payload.username,
        email: payload.email,
        password: payload.password,
        companyName: payload.companyName,
        companyEmail: payload.companyEmail,
        companyLogo: payload.companyLogo,
        companyPhone: payload.companyPhone,
        companyWebsite: payload.companyWebsite,
      });

      // Step 2: Store the token temporarily so the groups API can use it
      setStoredAuth({ token: authResponse.access_token, user: authResponse.user });

      // Step 3: Create the group using the groups API
      try {
        await createGroup({ title: payload.groupTitle });
      } catch (groupError) {
        console.error('Failed to create group:', groupError);
        // Continue with login even if group creation fails
        // The user can create a group later
      }

      return authResponse;
    },
    onSuccess: (data) => {
      login(data);
      navigate("/dashboard", { replace: true });
    }
  });
};

