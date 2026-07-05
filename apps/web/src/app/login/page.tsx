import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/auth/components/login-form.client";
import { auth } from "@/auth/utils/auth";
import { Link } from "@/core/components/ui";
import { ENV } from "@/core/constants/env";
import {
  createMetadata,
  createWebPage,
  createWebSite,
  JsonLd,
} from "@/core/utils/seo";

const title = "Login";
const description =
  "Sign in to your account to access personalized features, manage your profile, and enjoy a seamless experience across our platform.";
const ldParams = {
  url: `${ENV.NEXT_PUBLIC_APP_URL}/login`,
  title,
  description,
};

export const metadata = createMetadata({
  title,
  description,
});

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const t = await getTranslations();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* form */}
      <section className="flex min-h-screen w-full flex-col justify-center px-10 md:w-1/2 xl:px-20">
        <h1 className="text-center text-3xl text-primary">{t("welcome")}</h1>

        <LoginForm />

        <p className="py-12 text-center">
          {t("noAccount")}{" "}
          <Link
            aria-label={t("registerHere")}
            className="hover:underline"
            href="/register"
          >
            {t("registerHere")}
          </Link>
        </p>
      </section>

      {/* image */}
      <section className="hidden w-1/2 shadow-2xl md:block">
        <span className="relative h-screen w-full md:flex md:items-center md:justify-center">
          <svg viewBox="0 0 512 512" className="size-60">
            <use href="#icon-nextjs" />
          </svg>
        </span>
      </section>

      <JsonLd graphs={[createWebSite(ldParams), createWebPage(ldParams)]} />
    </div>
  );
}
