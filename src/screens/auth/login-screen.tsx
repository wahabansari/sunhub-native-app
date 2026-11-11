import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthLink } from '@/components/auth/auth-link';
import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { TextField, type TextFieldHandle } from '@/components/forms/text-field';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useAuth } from '@/hooks/use-auth';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useGoBack } from '@/hooks/use-go-back';
import { accountService } from '@/services/auth';
import { hasFormErrors, validateSignInForm, type SignInFormErrors } from '@/validation/auth';

export function LoginScreen() {
  const goBack = useGoBack();
  const { state, signIn, clearError } = useAuth();
  const { destination, goTo } = useAuthRedirect();
  const params = useLocalSearchParams<{ reset?: string; email?: string }>();
  const resend = useAccountRequest();
  const passwordRef = useRef<TextFieldHandle>(null);
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<SignInFormErrors>({});
  const [resent, setResent] = useState(false);

  // An error left over from an earlier visit must not greet a fresh sign-in attempt.
  useEffect(() => clearError(), [clearError]);

  if (state.status === 'authenticated') return <Redirect href={destination} />;

  const unverified = state.errorCode === 'AUTH_UNVERIFIED';

  const submit = async () => {
    const found = validateSignInForm({ email, password });
    setErrors(found);
    setResent(false);
    if (hasFormErrors(found)) return;
    await signIn({ email: email.trim(), password });
  };

  const resendVerification = async () => {
    const sent = await resend.run(() => accountService.resendVerification({ email, password }));
    setResent(sent);
  };

  return (
    <AuthScaffold
      title="Welcome back!"
      subtitle="Login to your Sunhub account"
      onBack={goBack}
      footer={
        <AuthLink
          prompt="Don't have an account?"
          label="Register now"
          onPress={() => goTo('/register')}
        />
      }
    >
      {params.reset === '1' ? (
        <FormBanner tone="success" message="Password updated. Sign in with your new password." />
      ) : null}
      <TextField
        label="Email Address"
        icon="mail"
        required
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="Enter your email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />
      <TextField
        label="Password"
        icon="lock"
        inputRef={passwordRef}
        required
        secret
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="Enter your password"
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Pressable
        onPress={() => goTo('/forgot-password')}
        hitSlop={8}
        accessibilityRole="link"
        className="-mt-[6px] self-end"
      >
        <Text className="font-poppins-medium text-[13.5px] text-primary">
          Forgot your password?
        </Text>
      </Pressable>
      {state.error ? (
        <FormBanner
          tone={unverified ? 'info' : 'error'}
          message={state.error}
          action={
            unverified && email && password
              ? {
                  label: 'Resend verification email',
                  onPress: resendVerification,
                  isBusy: resend.isSubmitting,
                }
              : undefined
          }
        />
      ) : null}
      {resent ? (
        <FormBanner tone="success" message="Verification email sent. Check your inbox." />
      ) : null}
      {resend.error ? <FormBanner tone="error" message={resend.error} /> : null}
      <View className="pt-[4px]">
        <SubmitButton label="Login" onPress={submit} isLoading={state.isSubmitting} />
      </View>
    </AuthScaffold>
  );
}
