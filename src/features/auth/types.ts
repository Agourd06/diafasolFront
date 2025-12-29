export type UserRole = "admin" | "manager" | "agent" | "guest";

/**
 * Company entity - separate database table
 * Created first during registration, then linked to User via companyId
 */
export type Company = {
  id: number;
  name: string;
  email: string;
  logo?: string | null;
  phone?: string | null;
  website?: string | null;
  statut?: number;
  createdAt?: string;
  updatedAt?: string;
  // Theme colors for dynamic branding
  primaryColor?: string | null; // hex color like "#214fd6"
  secondaryColor?: string | null;
  accentColor?: string | null;
};

/**
 * User entity - separate database table
 * Relationship: Many Users belong to One Company (via companyId foreign key)
 * 
 * @property companyId - Foreign key reference to the Company table
 * @property company - Full company object (populated in registration response, may be undefined in login)
 */
export type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  companyId: number; // Foreign key → companies.id
  company?: Company; // Full company entity (included in registration response)
};

export type AuthResponse = {
  access_token: string;
  user: User;
};

export type LoginPayload = {
  /**
   * Backend accepts either email or username in this field.
   */
  email: string;
  password: string;
};

/**
 * Payload sent to the backend auth/register endpoint
 * Creates user and company in the database
 */
export type AuthRegisterPayload = {
  username: string;
  email: string;
  password: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string;
  companyPhone?: string;
  companyWebsite?: string;
};

/**
 * Full registration payload including group title
 * The frontend will:
 * 1. Call auth/register with AuthRegisterPayload (creates user + company)
 * 2. Call groups API to create the group (using groupTitle)
 */
export type RegisterPayload = AuthRegisterPayload & {
  groupTitle: string; // Required - group is created via groups API after registration
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

