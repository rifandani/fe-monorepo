import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { LanguageToggle } from "@/components/language-toggle";
import { ProfileMenu } from "@/components/profile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { hasValidSession } from "@/features/auth/utils/has-valid-session";
import { useSeo } from "@/hooks/use-seo";
import { useTranslation } from "@/providers/i18n/context";

const HomeRoute = () => {
  useSeo({
    description:
      "Welcome to our React.js application. Explore our modern, feature-rich web platform with theme customization, multi-language support, and user profiles.",
    title: "Home",
  });
  const { t } = useTranslation();

  return (
    <div className="container mx-auto flex flex-col items-center gap-y-2 py-24">
      <h1 className="text-3xl sm:text-4xl">{t("title")}</h1>
      <h2 className="font-mono text-xl sm:text-2xl">{t("welcome")}</h2>

      <div className="flex items-center gap-x-2">
        <ThemeToggle />
        <LanguageToggle />
        <ProfileMenu />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    const authed = hasValidSession();

    if (!authed) {
      // redirect unauthorized user to login
      toast.error("Unauthorized");
      throw redirect({
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can potentially lag behind the actual current location)
          redirect: location.href,
        },
        to: "/login",
      });
    }
  },
  component: HomeRoute,
});
