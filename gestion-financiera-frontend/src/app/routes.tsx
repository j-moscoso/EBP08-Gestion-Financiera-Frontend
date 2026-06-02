import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { RecoveryCodesPage } from "./pages/RecoveryCodesPage";
import { RecoveryCodeLoginPage } from "./pages/RecoveryCodeLoginPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { IncomesPage } from "./pages/IncomesPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/recovery-codes",
    Component: RecoveryCodesPage,
  },
  {
    path: "/recovery-code-login",
    Component: RecoveryCodeLoginPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: "budgets",
        Component: BudgetsPage,
      },
      {
        path: "incomes",
        Component: IncomesPage,
      },
      {
        path: "expenses",
        Component: ExpensesPage,
      },
      {
        path: "categories",
        Component: CategoriesPage,
      },
      {
        path: "recommendations",
        Component: RecommendationsPage,
      },
      {
        path: "reports",
        Component: ReportsPage,
      },
      {
        path: "profile",
        Component: ProfilePage,
      },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
