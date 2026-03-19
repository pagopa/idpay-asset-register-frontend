// Global Jest mock for @pagopa/selfcare-common-frontend
// This avoids ESM + import.meta issues during test execution.

module.exports = {
  // Hooks
  useUnloadEventOnExit: () => {},
  useUnloadEventInterceptor: () => {},
  useUser: () => ({}),
  usePermissions: () => ([]),

  // API utilities
  buildFetchApi: () => async () => ({
      ok: true,
      json: async () => ({}),
      text: async () => '',
    }),

  // Components (mock as simple passthrough components)
  LoadingOverlay: ({ children }) => children || null,
  UserContextProvider: ({ children }) => children || null,

  // ESM compatibility
  __esModule: true,
  default: {}
};
