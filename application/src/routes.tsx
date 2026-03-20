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

const outreachRoutes = {
  path: "outreach",
  children: [
    { path: "view/:id", Component: OutreachDetailPage },
    {
      Component: OutreachWizard,
      children: [
        { index: true, element: <Navigate to="templates" replace /> },
        { path: "templates", Component: SelectTemplatePage },
        { path: "recipient-info", Component: RecipientInfoPage },
        { path: "preview/:id", Component: EmailPreviewPage },
        { path: "send/:id", Component: SendEmailPage },
      ],
    },
  ],
};

const authRoutes = {
  Component: AuthLayout,
  children: [
    { path: "login", Component: LoginPage },
    { path: "signup", Component: SignupPage },
    { path: "sso-callback", Component: SSOCallbackPage },
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
              { path: "basic-info", Component: BasicInfoPage },
              { path: "professional-info", Component: ProfessionalInfoPage },
            ],
          },
          {
            element: <MainLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", Component: DashboardPage },
              { path: "drafts", Component: DraftsPage },
              { path: "settings", Component: SettingsPage },
              { path: "profile", Component: ProfilePage },
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
