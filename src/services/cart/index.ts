import { apiClient } from '@/services/api';
import { logger } from '@/services/logging';
import { createSessionStorage } from '@/services/storage/session-storage';

import { createCartService } from './cart-service';
import { createCheckoutService } from './checkout-service';
import { createGuestOwnerStore } from './guest-owner';

const session = createSessionStorage();
const guest = createGuestOwnerStore();

export const cartService = createCartService({ api: apiClient, session, guest, logger });
export const checkoutService = createCheckoutService({ api: apiClient, session, guest });

export type { CartService } from './cart-service';
export type { BillingAddress, CardToken, CheckoutService } from './checkout-service';
