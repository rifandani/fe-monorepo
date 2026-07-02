import { RouterProvider } from "@tanstack/react-router";

import { router } from "./client";

export const AppRouterProvider = () => <RouterProvider router={router} />;
