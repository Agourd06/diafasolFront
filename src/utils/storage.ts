import { User } from "../features/auth/types";

const TOKEN_KEY = "diafa_token";
const USER_KEY = "diafa_user";

type StoredAuth = {
  token: string | null;
  user: User | null;
};

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse storage value", error);
    return null;
  }
};

export const getStoredToken = (): StoredAuth => {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const user = safeParse<User>(localStorage.getItem(USER_KEY));
  return { token, user };
};

export const setStoredAuth = ({ token, user }: StoredAuth) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const removeStoredAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// App Context Storage
const APP_CONTEXT_KEY = "diafa_app_context";

type StoredAppContext = {
  companyId: number;
  groupId: string | null;
  propertyId: string | null;
  taxSetId?: string | null;
  roomTypeId?: string | null;
  ratePlanId?: string | null;
};

export const getStoredAppContext = (): StoredAppContext | null => {
  if (typeof window === "undefined") return null;
  return safeParse<StoredAppContext>(localStorage.getItem(APP_CONTEXT_KEY));
};

export const setStoredAppContext = (context: StoredAppContext) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_CONTEXT_KEY, JSON.stringify(context));
};

export const removeStoredAppContext = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(APP_CONTEXT_KEY);
};

