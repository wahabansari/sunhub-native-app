import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InfoCard, StatusChip } from '@/components/account/account-parts';
import { useToast } from '@/components/feedback/toast';
import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { TextField } from '@/components/forms/text-field';
import { toUserMessage } from '@/errors';
import { useChangePassword } from '@/hooks/use-account-data';
import { useAuth } from '@/hooks/use-auth';
import { isNonEmpty } from '@/utils/validation';
import { roleLabel } from '@/utils/roles';
import { hasFormErrors, validateResetPasswordForm } from '@/validation/auth';

import { AccountPage } from './account-page';

type Errors = { current?: string; password?: string; passwordConfirmation?: string };

function PasswordForm() {
  const toast = useToast();
  const change = useChangePassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    const found: Errors = validateResetPasswordForm({
      password: next,
      passwordConfirmation: confirmation,
    });
    if (!isNonEmpty(current)) found.current = 'Enter your current password.';
    setErrors(found);
    if (hasFormErrors(found)) return;

    change.mutate(
      { current, next, confirmation },
      {
        onSuccess: () => {
          setCurrent('');
          setNext('');
          setConfirmation('');
          toast.show('Password updated');
        },
      },
    );
  };

  return (
    <View className="gap-[16px]">
      <TextField
        label="Current password"
        icon="lock"
        required
        secret
        value={current}
        onChangeText={setCurrent}
        error={errors.current}
        placeholder="Enter your current password"
        autoCapitalize="none"
        autoComplete="current-password"
      />
      <TextField
        label="New password"
        icon="lock"
        required
        secret
        value={next}
        onChangeText={setNext}
        error={errors.password}
        placeholder="Enter a new password"
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <TextField
        label="Confirm new password"
        icon="lock"
        required
        secret
        value={confirmation}
        onChangeText={setConfirmation}
        error={errors.passwordConfirmation}
        placeholder="Re-enter the new password"
        autoCapitalize="none"
        autoComplete="new-password"
      />
      {change.error ? <FormBanner tone="error" message={toUserMessage(change.error)} /> : null}
      <SubmitButton label="Update password" onPress={submit} isLoading={change.isPending} />
    </View>
  );
}

/** Profile summary and password change, for every role. */
export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAuth();
  const user = state.user;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Sunhub member';

  return (
    <AccountPage title="Account settings">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: insets.bottom + 24 }}
      >
        <InfoCard>
          <Text className="font-poppins-semibold text-[17px] text-ink">{name}</Text>
          {user?.email ? (
            <Text className="font-inter text-[13.5px] text-muted">{user.email}</Text>
          ) : null}
          <StatusChip status="active" label={roleLabel(user?.roles ?? [])} />
        </InfoCard>
        <View className="gap-[12px]">
          <Text accessibilityRole="header" className="font-poppins-semibold text-[16px] text-ink">
            Change password
          </Text>
          <PasswordForm />
        </View>
      </ScrollView>
    </AccountPage>
  );
}
