import type { ReactNode } from 'react';

/** What the shared marketplace page needs from one listing mode (Buy now or Negotiable). */
export type MarketplacePane = {
  title: string;
  isLoading: boolean;
  filterCount: number;
  openFilters: () => void;
  grid: ReactNode;
  sheet: ReactNode;
};
