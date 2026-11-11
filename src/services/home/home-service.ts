import { API_ENDPOINTS } from '@/constants/api';
import {
  ARTICLE_SEEDS,
  normalizeArticle,
  normalizeBrand,
  normalizeDeal,
  normalizePickupStates,
  normalizeProduct,
  rowsFrom,
} from '@/services/catalog/catalog-normalizers';
import {
  requestBlog,
  requestBroker,
  requestMain,
  requestMainRaw,
} from '@/services/catalog/catalog-requests';
import { buildProductBody } from '@/services/catalog/listing-queries';
import { logger } from '@/services/logging';
import type { HomeArticle, HomeBrand, HomeDeal, HomeProduct, PickupState } from '@/types/home';

/** Home requests give up sooner than the app default so a section can show its retry state. */
const HOME_TIMEOUT_MS = 20_000;
const options = { timeoutMs: HOME_TIMEOUT_MS };

// Each loader is independent and throws on failure, so React Query can retry it and the
// section that owns it can show a loading, error or empty state of its own.

export async function loadFeaturedDeals(): Promise<HomeDeal[]> {
  const payload = await requestBroker(
    `${API_ENDPOINTS.broker.featuredListings}?listing_type=panels`,
    options,
  );
  return rowsFrom(payload).map(normalizeDeal).slice(0, 6);
}

export async function loadRecentDeals(): Promise<HomeDeal[]> {
  const payload = await requestBroker(
    `${API_ENDPOINTS.broker.recentListings}?listing_type=panels`,
    options,
  );
  return rowsFrom(payload).map(normalizeDeal).slice(0, 5);
}

export async function loadSpotlightDeals(): Promise<HomeDeal[]> {
  const payload = await requestBroker(
    `${API_ENDPOINTS.broker.publicListings}?page=1&sort=recommended&homePage=true&isHotDeal=true`,
    options,
  );
  return rowsFrom(payload).map(normalizeDeal).slice(0, 4);
}

export async function loadPickupStates(): Promise<PickupState[]> {
  const payload = await requestBroker(
    `${API_ENDPOINTS.broker.brokerSidebar}?key=homepage`,
    options,
  );
  return normalizePickupStates(payload).sort((a, b) => b.total - a.total);
}

const BUY_DIRECT_COUNT = 6;

/** Sponsored products first; if none are running, the newest in-stock products keep the section useful. */
export async function loadBuyDirectProducts(): Promise<HomeProduct[]> {
  const fetchPage = async (sponsored: boolean) =>
    rowsFrom(
      await requestMainRaw(
        API_ENDPOINTS.catalog.productsSearch,
        buildProductBody({ sponsored }, 1, BUY_DIRECT_COUNT),
        options,
      ),
    ).map(normalizeProduct);

  const sponsored = await fetchPage(true);
  return sponsored.length ? sponsored : fetchPage(false);
}

export async function loadBrands(): Promise<HomeBrand[]> {
  const rows = await requestMain<unknown[]>(
    API_ENDPOINTS.catalog.brandsSearch,
    { fields: ['id', 'name', 'status', 'logo'], limit: 7 },
    options,
  );
  return rowsFrom(rows).map(normalizeBrand).slice(0, 7);
}

/** Articles fall back to the bundled list when the blog is unreachable, so the section never empties. */
export async function loadArticles(): Promise<HomeArticle[]> {
  try {
    const articles = rowsFrom(await requestBlog(options))
      .map(normalizeArticle)
      .slice(0, 6);
    return articles.length ? articles : ARTICLE_SEEDS;
  } catch (error) {
    logger.warn('Blog unavailable, showing bundled articles', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    return ARTICLE_SEEDS;
  }
}
