export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  profileStatus: string;
  roles: string[];
}

export interface AuthProfile {
  email: string;
  firstName: string;
  lastName: string;
  profileStatus: string;
  roles: string[];
}

export interface LoginResult {
  accessToken: string;
  roles: string[];
}

/**
 * The only credential material persisted on the device. Profile data is
 * re-fetched from the API when a session is restored.
 */
export interface StoredSession {
  accessToken: string;
  roles: string[];
}

export interface AuthService {
  restoreSession(): Promise<AuthUser | null>;
  signIn(credentials: SignInCredentials): Promise<AuthUser>;
  signOut(): Promise<void>;
}

export type RegistrationRole = 'customer' | 'seller' | 'both';

export interface RegisterInput {
  role: RegistrationRole;
  fullName: string;
  companyName?: string;
  email: string;
  /** Any formatting is accepted; only the digits are sent. */
  phone: string;
  password: string;
  passwordConfirmation: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}

/** Account actions that work without a signed-in session. */
export interface AccountService {
  register(input: RegisterInput): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
  resendVerification(credentials: SignInCredentials): Promise<void>;
}
