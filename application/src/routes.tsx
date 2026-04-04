import GlobalError from "@/components/function/global-error";
import ProtectedRoute from "@/components/function/ProtectedRoute";
import PublicRoute from "@/components/function/PublicRoute";
import MainLayout from "@/components/layout/MainLayout";
import OnboardingLayout from "@/components/layout/OnboardingLayout";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import SSOCallbackPage from "@/pages/auth/sso-callback";
import DashboardPage from "@/pages/dashboard";
import DraftsPage from "@/pages/drafts";
import NotFound from "@/pages/not-found";
import BasicInfoPage from "@/pages/onboarding/basic-info";
import ProfessionalInfoPage from "@/pages/onboarding/professional-info";
import OutreachWizard from "@/pages/outreach";
import OutreachDetailPage from "@/pages/outreach/detail";
import EmailPreviewPage from "@/pages/outreach/email-preview";
import RecipientInfoPage from "@/pages/outreach/recipient-info";
import SelectTemplatePage from "@/pages/outreach/select-template";
import SendEmailPage from "@/pages/outreach/send-email";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "./components/layout/AuthLayout";
import { ROUTES } from "@/lib/consts/routesConsts";

const outreachRoutes = {
  path: "outreach",
  children: [
    {
      path: ROUTES.OUTREACH.DETAIL.getPath(":id"),
      Component: OutreachDetailPage,
    },
    {
      Component: OutreachWizard,
      children: [
        {
          index: true,
          element: <Navigate to={ROUTES.OUTREACH.TEMPLATES.path} replace />,
        },
        { path: ROUTES.OUTREACH.TEMPLATES.path, Component: SelectTemplatePage },
        {
          path: ROUTES.OUTREACH.RECIPIENT_INFO.path,
          Component: RecipientInfoPage,
        },
        {
          path: ROUTES.OUTREACH.PREVIEW.getPath(":id"),
          Component: EmailPreviewPage,
        },
        { path: ROUTES.OUTREACH.SEND.getPath(":id"), Component: SendEmailPage },
      ],
    },
  ],
};

const authRoutes = {
  Component: AuthLayout,
  children: [
    { path: ROUTES.LOGIN.path, Component: LoginPage },
    { path: ROUTES.SIGNUP.path, Component: SignupPage },
    { path: ROUTES.SSO_CALLBACK.path, Component: SSOCallbackPage },
  ],
};

const routes = createBrowserRouter([
  {
    path: "/",
    ErrorBoundary: GlobalError,
    children: [
      {
        Component: PublicRoute,
        children: [authRoutes],
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "onboarding",
            Component: OnboardingLayout,
            children: [
              { path: ROUTES.ONBOARDING.BASIC_INFO.path, Component: BasicInfoPage },
              {
                path: ROUTES.ONBOARDING.PROFESSIONAL_INFO.path,
                Component: ProfessionalInfoPage,
              },
            ],
          },
          {
            element: <MainLayout />,
            children: [
              {
                index: true,
                element: <Navigate to={ROUTES.DASHBOARD.path} replace />,
              },
              { path: ROUTES.DASHBOARD.path, Component: DashboardPage },
              { path: ROUTES.DRAFTS.path, Component: DraftsPage },
              { path: ROUTES.SETTINGS.path, Component: SettingsPage },
              { path: ROUTES.PROFILE.path, Component: ProfilePage },
              outreachRoutes,
            ],
          },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default routes;
