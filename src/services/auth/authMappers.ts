import { ACTIVE_PROFILE_STATUS } from '@/constants/app';
import { AppError } from '@/errors/AppError';
import type { AuthProfile, AuthUser, LoginResult } from '@/types/auth';
import { asNonEmptyString, asStringArray, isRecord } from '@/utils/guards';

function invalidResponse(message: string): AppError {
  return new AppError('AUTH_INVALID_RESPONSE', message, {
    userMessage: 'The server returned an unexpected response. Please try again.',
  });
}

function readMessages(payload: Record<string, unknown>): string[] {
  const messages = asStringArray(payload.errors)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const single = asNonEmptyString(payload.error) ?? asNonEmptyString(payload.message);

  if (single) {
    messages.unshift(single);
  }

  return messages;
}

function rejected(payload: Record<string, unknown>, fallback: string): never {
  const [message] = readMessages(payload);

  throw new AppError('AUTH_FAILED', 'Authentication request was rejected', {
    userMessage: message ?? fallback,
  });
}

export function parseLoginResponse(payload: unknown): LoginResult {
  if (!isRecord(payload)) {
    throw invalidResponse('Login response was not an object');
  }

  if (payload.status !== true) {
    rejected(payload, 'Unable to sign in. Check your email and password.');
  }

  const data = payload.data;

  if (!isRecord(data)) {
    throw invalidResponse('Login response did not include data');
  }

  const auth = data.auth;
  const accessToken = isRecord(auth) ? asNonEmptyString(auth.access_token) : null;

  if (!accessToken) {
    throw invalidResponse('Login response did not include an access token');
  }

  return {
    accessToken,
    roles: asStringArray(data.role),
  };
}

export function parseProfileResponse(payload: unknown): AuthProfile {
  if (!isRecord(payload)) {
    throw invalidResponse('Profile response was not an object');
  }

  if (payload.status !== true) {
    rejected(payload, 'Unable to load your profile.');
  }

  const data = payload.data;

  if (!isRecord(data)) {
    throw invalidResponse('Profile response did not include data');
  }

  const profileStatus = asNonEmptyString(data.status);

  if (!profileStatus) {
    throw invalidResponse('Profile response did not include a status');
  }

  return {
    profileStatus,
    email: asNonEmptyString(data.email) ?? '',
    firstName: asNonEmptyString(data.firstname) ?? asNonEmptyString(data.first_name) ?? '',
    lastName: asNonEmptyString(data.lastname) ?? asNonEmptyString(data.last_name) ?? '',
    roles: asStringArray(data.role),
  };
}

export function isActiveProfile(status: string): boolean {
  return status.trim().toLowerCase() === ACTIVE_PROFILE_STATUS;
}

export function makeAuthUser(profile: AuthProfile, roles: string[]): AuthUser {
  return {
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileStatus: profile.profileStatus,
    roles: roles.length > 0 ? roles : profile.roles,
  };
}
