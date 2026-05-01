import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { IncomesPage } from "./pages/IncomesPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { ProfilePage } from "./pages/ProfilePage";
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
