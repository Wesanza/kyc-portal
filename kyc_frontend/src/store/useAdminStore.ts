/**
 * Re-exports the admin Zustand store from its canonical location.
 *
 * The store is defined in hooks/useAdminAuth.ts (co-located with its hook)
 * but exposed here so the file tree matches the EPIC spec:
 *   store/useAdminStore.ts  ← import from here in components
 *   hooks/useAdminAuth.ts   ← import the hook from here
 */
export { useAdminStore } from '../hooks/useAdminAuth';
export type { } from '../hooks/useAdminAuth';
