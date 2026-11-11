import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/icon';

type Tone = 'success' | 'error';
type Toast = { id: number; message: string; tone: Tone };

const VISIBLE_MS = 2400;

type ToastApi = { show: (message: string, tone?: Tone) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider.');
  return context;
}

function ToastView({ toast }: { toast: Toast }) {
  const insets = useSafeAreaInsets();
  const success = toast.tone === 'success';

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 items-center px-md"
      style={{ bottom: insets.bottom + 20 }}
    >
      <Animated.View
        entering={FadeInDown.duration(220)}
        exiting={FadeOutDown.duration(180)}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className={`max-w-full flex-row items-center gap-[8px] rounded-full px-[16px] py-[11px] ${
          success ? 'bg-ink' : 'bg-danger'
        }`}
      >
        <Icon name={success ? 'check' : 'close'} size={16} color="#FFFFFF" strokeWidth={2.6} />
        <Text className="shrink font-inter-medium text-[13.5px] text-white">{toast.message}</Text>
      </Animated.View>
    </View>
  );
}

/** One short message at a time, shown above the screen and gone after a couple of seconds. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const show = useCallback((message: string, tone: Tone = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    counter.current += 1;
    setToast({ id: counter.current, message, tone });
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} /> : null}
    </ToastContext.Provider>
  );
}
