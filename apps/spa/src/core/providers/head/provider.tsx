import { useHead, useSeoMeta } from "@unhead/react";
import { createHead, UnheadProvider } from "@unhead/react/client";
import { TemplateParamsPlugin } from "@unhead/react/plugins";

import { ENV } from "@/core/constants/env";
import { buildSeoMetadata } from "@/core/utils/seo";

const defaultSeo = buildSeoMetadata({});

const head = createHead({
  plugins: [TemplateParamsPlugin],
});

const HeadDefaults = () => {
  useHead({
    templateParams: {
      schemaOrg: {
        host: ENV.VITE_APP_URL,
      },
    },
  });
  useSeoMeta(defaultSeo.metadata);
  return null;
};

export const AppHeadProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <UnheadProvider head={head}>
    <HeadDefaults />
    {children}
  </UnheadProvider>
);
