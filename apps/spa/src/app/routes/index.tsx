import { createFileRoute } from "@tanstack/react-router";

import { sessionGate } from "@/app/providers/router/session-gate";
import { LanguageToggle } from "@/components/language-toggle";
import { ProfileMenu } from "@/components/profile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
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
  beforeLoad: sessionGate.requireSession,
  component: HomeRoute,
});
