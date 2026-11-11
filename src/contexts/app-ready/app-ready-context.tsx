import { createContext, useContext } from 'react';

export type AppReadyValue = {
  /** False while the splash is up, so the home screen can hold its entrance animation. */
  homeActive: boolean;
  /** The home screen calls this once its first load has settled. */
  reportHomeReady: () => void;
};

const noop = () => undefined;

export const AppReadyContext = createContext<AppReadyValue>({
  homeActive: true,
  reportHomeReady: noop,
});

export function useAppReady(): AppReadyValue {
  return useContext(AppReadyContext);
}
