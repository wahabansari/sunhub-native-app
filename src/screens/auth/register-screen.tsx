import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { AuthLink } from '@/components/auth/auth-link';
import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { RolePicker } from '@/components/auth/role-picker';
import { CheckboxRow } from '@/components/forms/checkbox-row';
import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { TextField } from '@/components/forms/text-field';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useAuth } from '@/hooks/use-auth';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useGoBack } from '@/hooks/use-go-back';
import { accountService } from '@/services/auth';
import type { RegistrationRole } from '@/types/auth';
import { formatUsPhone } from '@/utils/auth-links';
import {
  hasFormErrors,
  validateRegisterForm,
  type RegisterFormErrors,
  type RegisterFormValues,
} from '@/validation/auth';

const TERMS_URL = 'https://www.sunhub.com/terms-of-use';

const EMPTY_FORM: RegisterFormValues = {
  role: 'customer',
  fullName: '',
  companyName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: '',
  agreed: false,
};

function RegistrationDone({ email, onLogin }: { email: string; onLogin: () => void }) {
  return (
    <View className="flex-1 justify-center gap-[16px] bg-white px-md">
      <FormBanner
        tone="success"
        message={`Your account was created. We sent a verification link to ${email}. Verify your email, then sign in.`}
      />
      <SubmitButton label="Go to login" onPress={onLogin} />
    </View>
  );
}

export function RegisterScreen() {
  const goBack = useGoBack();
  const { state } = useAuth();
  const { destination, goTo } = useAuthRedirect();
  const request = useAccountRequest();
  const [form, setForm] = useState<RegisterFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  if (state.status === 'authenticated') return <Redirect href={destination} />;
  if (registeredEmail) {
    return (
      <RegistrationDone
        email={registeredEmail}
        onLogin={() => goTo('/login', { email: registeredEmail })}
      />
    );
  }

  const update = <Key extends keyof RegisterFormValues>(key: Key, value: RegisterFormValues[Key]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const changeRole = (role: RegistrationRole) =>
    setForm((previous) => ({
      ...previous,
      role,
      companyName: role === 'customer' ? '' : previous.companyName,
    }));

  const submit = async () => {
    const found = validateRegisterForm(form);
    setErrors(found);
    if (hasFormErrors(found)) return;

    const done = await request.run(() =>
      accountService.register({
        role: form.role,
        fullName: form.fullName,
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
      }),
    );
    if (done) setRegisteredEmail(form.email.trim());
  };

  const showCompany = form.role !== 'customer';
  const server = request.fieldErrors;

  return (
    <AuthScaffold
      title="Create an account"
      subtitle="Register here if you are a new customer"
      onBack={goBack}
      footer={
        <AuthLink prompt="Already have an account?" label="Login" onPress={() => goTo('/login')} />
      }
    >
      <RolePicker value={form.role} onChange={changeRole} />
      <TextField
        label="Full Name"
        placeholder="Enter your full name"
        icon="user"
        required
        value={form.fullName}
        onChangeText={(value) => update('fullName', value)}
        error={errors.fullName ?? server.firstname}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
      />
      {showCompany ? (
        <TextField
          label="Company Name"
          placeholder="Company name (optional)"
          icon="building"
          value={form.companyName}
          onChangeText={(value) => update('companyName', value)}
          error={errors.companyName ?? server.companyname}
          autoCapitalize="words"
        />
      ) : null}
      <TextField
        label="Email Address"
        placeholder="Enter your email address"
        icon="mail"
        required
        value={form.email}
        onChangeText={(value) => update('email', value)}
        error={errors.email ?? server.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextField
        label="Phone"
        icon="phone"
        required
        prefix="+1"
        value={form.phone}
        onChangeText={(value) => update('phone', formatUsPhone(value))}
        error={errors.phone ?? server.phone}
        placeholder="(xxx) xxx-xxxx"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
      <TextField
        label="Password"
        placeholder="Create a password"
        icon="lock"
        required
        secret
        value={form.password}
        onChangeText={(value) => update('password', value)}
        error={errors.password ?? server.password}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm Password"
        placeholder="Re-enter your password"
        icon="lock"
        required
        secret
        value={form.passwordConfirmation}
        onChangeText={(value) => update('passwordConfirmation', value)}
        error={errors.passwordConfirmation}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <CheckboxRow
        checked={form.agreed}
        onToggle={() => update('agreed', !form.agreed)}
        error={errors.agreed}
      >
        I have read and agree to the{' '}
        <Text
          onPress={() => void Linking.openURL(TERMS_URL)}
          accessibilityRole="link"
          className="font-inter-semibold text-primary"
        >
          Sunhub Terms of Use
        </Text>
      </CheckboxRow>
      {request.error ? <FormBanner tone="error" message={request.error} /> : null}
      <SubmitButton label="Create account" onPress={submit} isLoading={request.isSubmitting} />
    </AuthScaffold>
  );
}
