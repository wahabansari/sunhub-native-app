import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthLink } from '@/components/auth/auth-link';
import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { TextField } from '@/components/forms/text-field';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useGoBack } from '@/hooks/use-go-back';
import { accountService } from '@/services/auth';
import { parseResetLink } from '@/utils/auth-links';
import {
  hasFormErrors,
  validateResetPasswordForm,
  type ResetPasswordErrors,
} from '@/validation/auth';

const BAD_LINK_MESSAGE =
  'That does not look like a Sunhub reset link. Paste the full link from the email.';

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export function ResetPasswordScreen() {
  const goBack = useGoBack();
  const { goTo } = useAuthRedirect();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const request = useAccountRequest();
  const linkedToken = firstParam(params.token);
  const email = firstParam(params.email);
  const [link, setLink] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [linkError, setLinkError] = useState<string | undefined>();

  const needsLink = !linkedToken;

  const submit = async () => {
    const found = validateResetPasswordForm({ password, passwordConfirmation: confirmation });
    setErrors(found);

    let target = { email, token: linkedToken };
    if (needsLink) {
      const parsed = parseResetLink(link);
      setLinkError(parsed ? undefined : BAD_LINK_MESSAGE);
      if (!parsed) return;
      target = parsed;
    }
    if (hasFormErrors(found)) return;

    const done = await request.run(() =>
      accountService.resetPassword({
        ...target,
        password,
        passwordConfirmation: confirmation,
      }),
    );
    if (done) goTo('/login', { reset: '1', email: target.email });
  };

  return (
    <AuthScaffold
      title="Set a new password"
      subtitle="Choose a strong password for your Sunhub account."
      onBack={goBack}
      footer={
        <AuthLink prompt="Know your password?" label="Login" onPress={() => goTo('/login')} />
      }
    >
      {needsLink ? (
        <TextField
          label="Reset link"
          icon="lock"
          required
          value={link}
          onChangeText={setLink}
          error={linkError}
          placeholder="Paste the link from your email"
          autoCapitalize="none"
          keyboardType="url"
          textContentType="URL"
        />
      ) : (
        <TextField
          label="Email Address"
          icon="mail"
          value={email}
          editable={false}
          autoCapitalize="none"
        />
      )}
      <TextField
        label="New Password"
        icon="lock"
        required
        secret
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="Enter your new password"
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm Password"
        icon="lock"
        required
        secret
        value={confirmation}
        onChangeText={setConfirmation}
        error={errors.passwordConfirmation}
        placeholder="Confirm your new password"
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      {request.error ? <FormBanner tone="error" message={request.error} /> : null}
      <View className="pt-[4px]">
        <SubmitButton label="Reset password" onPress={submit} isLoading={request.isSubmitting} />
      </View>
    </AuthScaffold>
  );
}
