import { clampPage, getCurrentPage, getTotalPages, resolveLastPage } from '@/utils/pagination';

describe('pagination helpers', () => {
  it('prefers total and per_page over last_page', () => {
    expect(resolveLastPage({ total: 101, per_page: 20, last_page: 99 })).toBe(6);
    expect(resolveLastPage({ total: 40, limit: 20 })).toBe(2);
  });

  it('falls back to API page metadata', () => {
    expect(resolveLastPage({ last_page: 4 })).toBe(4);
    expect(resolveLastPage({ total_pages: 3 })).toBe(3);
    expect(resolveLastPage({ totalPages: 2 })).toBe(2);
    expect(resolveLastPage(null)).toBe(0);
  });

  it('never reports fewer than one page', () => {
    expect(getTotalPages(null)).toBe(1);
    expect(getTotalPages({ last_page: 0 })).toBe(1);
  });

  it('clamps the current page', () => {
    const meta = { current_page: 8, last_page: 3 };
    expect(getCurrentPage(meta)).toBe(3);
    expect(getCurrentPage({ current_page: 0, last_page: 2 })).toBe(1);
    expect(clampPage(2.9, { last_page: 5 })).toBe(2);
    expect(clampPage(Number.NaN, { last_page: 5 })).toBe(1);
  });
});
