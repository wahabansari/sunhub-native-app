# API queries

The mobile app uses TanStack React Query for server state. The provider is
mounted once in `src/providers/app-providers.tsx`; screens and hooks must not
create a second `QueryClient`. All endpoint paths come from
`src/constants/api.ts`; React Query owns request lifecycle and cache state while
services own transport, validation, normalization, and safe errors.

## Defaults

- `staleTime`: 5 minutes, so revisiting a screen reuses fresh data.
- `gcTime`: 30 minutes, so unused data remains available for fast navigation.
- `retry`: 2 bounded retries for transient failures.
- `refetchOnWindowFocus`: disabled for native behavior.
- `refetchOnReconnect`: enabled.
- `networkMode`: the default native fetch mode; failed requests surface through
  the service error boundary and are not hidden by fallback data.

## Adding a domain query

1. Keep the endpoint call in a React-free service under `src/services/`.
2. Use the stable key factory in `src/constants/query-keys.ts`.
3. Wrap the service with `useQuery` in `src/hooks/`.
4. Validate and map `unknown` responses inside the service before returning data.
5. Use `query.refetch()` for pull-to-refresh; do not add local loading or cache
   state for the same request.
6. Use `queryClient.invalidateQueries({ queryKey })` after a mutation that
   changes related server data.

For mutations, use `useMutation` in a hook, call a service method in
`mutationFn`, map the server response before returning it, and invalidate the
smallest affected key in `onSuccess`. Do not put tokens, raw response bodies,
or request payloads in query keys or logs. Pass `AbortSignal` from the query
function to the API client when a service supports cancellation.

Example:

```ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => productService.search(filters),
  });
}
```

The shared defaults are deliberately conservative for mobile: five-minute
freshness avoids duplicate navigation requests, thirty-minute garbage
collection keeps recent screens warm, and two bounded retries handle transient
network failures. A screen should expose `isPending`, `isFetching`, and a safe
user-facing error from the hook; it should not duplicate loading/error state in
Context or local component state.

The current homepage is intentionally limited to the reference header, hero,
and bottom navigation. Its catalog service and `useHomeData` query are ready
for the next screen iteration without rendering product sections prematurely.
