import { useCallback, useState } from 'react';

import { isAppError } from '@/errors/app-error';
import { toUserMessage } from '@/errors/messages';

type RequestState = {
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
};

const IDLE: RequestState = { isSubmitting: false, error: null, fieldErrors: {} };

/** Tracks one account request (register, forgot password, …) and turns failures into form messages. */
export function useAccountRequest() {
  const [state, setState] = useState<RequestState>(IDLE);

  const run = useCallback(async (action: () => Promise<void>): Promise<boolean> => {
    setState({ isSubmitting: true, error: null, fieldErrors: {} });

    try {
      await action();
      setState(IDLE);
      return true;
    } catch (error) {
      setState({
        isSubmitting: false,
        error: toUserMessage(error),
        fieldErrors: isAppError(error) ? error.fieldErrors : {},
      });
      return false;
    }
  }, []);

  const reset = useCallback(() => setState(IDLE), []);

  return { ...state, run, reset };
}
