import { useRouter } from 'expo-router';
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
import { validateForgotPasswordForm } from '@/validation/auth';

export function ForgotPasswordScreen() {
  const goBack = useGoBack();
  const router = useRouter();
  const { goTo } = useAuthRedirect();
  const request = useAccountRequest();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async () => {
    const found = validateForgotPasswordForm({ email });
    setError(found.email);
    if (found.email) return;

    const sent = await request.run(() => accountService.requestPasswordReset(email));
    if (sent) setSentTo(email.trim());
  };

  return (
    <AuthScaffold
      title="Forgot password?"
      subtitle="Enter the email associated with your Sunhub account and we will send a reset link."
      onBack={goBack}
      footer={<AuthLink prompt="Remembered it?" label="Sign in" onPress={() => goTo('/login')} />}
    >
      {sentTo ? (
        <>
          <FormBanner
            tone="success"
            message={`If ${sentTo} has a Sunhub account, a reset link is on its way. Open the link from the email on this phone, or paste it on the next screen.`}
          />
          <SubmitButton
            label="I have my reset link"
            onPress={() => router.push({ pathname: '/reset-password', params: { email: sentTo } })}
          />
          <SubmitButton label="Send again" variant="outline" onPress={() => setSentTo(null)} />
        </>
      ) : (
        <>
          <TextField
            label="Email Address"
            icon="mail"
            required
            value={email}
            onChangeText={setEmail}
            error={error}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          {request.error ? <FormBanner tone="error" message={request.error} /> : null}
          <View className="pt-[4px]">
            <SubmitButton
              label="Send reset link"
              onPress={submit}
              isLoading={request.isSubmitting}
            />
          </View>
        </>
      )}
    </AuthScaffold>
  );
}
