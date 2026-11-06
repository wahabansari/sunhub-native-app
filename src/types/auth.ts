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
