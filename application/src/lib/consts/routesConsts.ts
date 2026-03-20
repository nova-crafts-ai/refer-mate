export const ROUTES = {
  LOGIN: { path: "login", fullPath: "/login" },
  SIGNUP: { path: "signup", fullPath: "/signup" },
  SSO_CALLBACK: { path: "sso-callback", fullPath: "/sso-callback" },
  ONBOARDING: {
    BASIC_INFO: { path: "basic-info", fullPath: "/onboarding/basic-info" },
    PROFESSIONAL_INFO: {
      path: "professional-info",
      fullPath: "/onboarding/professional-info",
    },
  },
  DASHBOARD: { path: "dashboard", fullPath: "/dashboard" },
  DRAFTS: { path: "drafts", fullPath: "/drafts" },
  SETTINGS: { path: "settings", fullPath: "/settings" },
  PROFILE: { path: "profile", fullPath: "/profile" },
  OUTREACH: {
    DETAIL: {
      getPath: (id: string) => `${id}`,
      getFullPath: (id: string) => `/outreach/${id}`,
    },
    TEMPLATES: { path: "templates", fullPath: "/outreach/templates" },
    RECIPIENT_INFO: {
      path: "recipient-info",
      fullPath: "/outreach/recipient-info",
    },
    PREVIEW: {
      getPath: (id: string) => `preview/${id}`,
      getFullPath: (id: string) => `/outreach/preview/${id}`,
    },
    SEND: {
      getPath: (id: string) => `send/${id}`,
      getFullPath: (id: string) => `/outreach/send/${id}`,
    },
  },
} as const;
