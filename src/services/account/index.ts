import { apiClient } from '@/services/api';
import { createSessionStorage } from '@/services/storage/session-storage';

import { createAccountDataService } from './account-data-service';

export const accountDataService = createAccountDataService({
  api: apiClient,
  session: createSessionStorage(),
});

export type { AccountDataService } from './account-data-service';
